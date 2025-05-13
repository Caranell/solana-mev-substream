use std::collections::HashSet;

use sha2::{Digest, Sha256};

use crate::pb::solana::mev::bundles::v1::{MevBundle, MevType, TradeData};

pub fn is_same_transaction(trade: &TradeData, prev_trade: &TradeData) -> bool {
    if trade.tx_index == prev_trade.tx_index && trade.signer == prev_trade.signer {
        return true;
    }

    return false;
}

pub fn is_valid_arbitrage_sequence(sequence: &Vec<TradeData>) -> bool {
    // Sequence should have at least 2 trades
    if sequence.len() < 2 {
        return false;
    }

    // All trades should be internal instructions, and signer should equal trader
    if !sequence
        .iter()
        .all(|trade| trade.is_inner_instruction && trade.signer == trade.trader)
    {
        return false;
    }

    let first_trade = sequence.first().unwrap();
    let last_trade = sequence.last().unwrap();

    let mut unique_traded_tokens: HashSet<String> = HashSet::new();
    unique_traded_tokens.insert(first_trade.base_mint.clone());
    unique_traded_tokens.insert(first_trade.quote_mint.clone());
    unique_traded_tokens.insert(last_trade.base_mint.clone());
    unique_traded_tokens.insert(last_trade.quote_mint.clone());

    // atomic arbitrage should always start&end with the same token
    // only possible arbitrage sequences are: a->b & b->a OR a->b & [b->c] & c->a
    if unique_traded_tokens.len() == 4 {
        return false;
    }

    return true;
}

pub fn is_sandwich_sequence(trade_a: &TradeData, trade_b: &TradeData, trade_c: &TradeData) -> bool {
    // By "MEV sanwich" defenition, first & last trades are made by same signer, while in the middle is their "victim"
    if trade_a.signer != trade_c.signer || trade_a.signer == trade_b.signer {
        return false;
    }

    let mut unique_traded_tokens: HashSet<String> = HashSet::new();
    unique_traded_tokens.insert(trade_a.base_mint.clone());
    unique_traded_tokens.insert(trade_a.quote_mint.clone());
    unique_traded_tokens.insert(trade_b.base_mint.clone());
    unique_traded_tokens.insert(trade_b.quote_mint.clone());
    unique_traded_tokens.insert(trade_c.base_mint.clone());
    unique_traded_tokens.insert(trade_c.quote_mint.clone());
    
    // sandwiches should only have 2 unique traded tokens
    if unique_traded_tokens.len() != 2  {
        return false;
    }


    return true;
}

pub fn format_bundle(mev_bundle: &Vec<TradeData>, mev_type: MevType) -> MevBundle {
    let bundle_id = format!("{:x}", Sha256::digest(mev_bundle[0].tx_id.clone()));


    let bundle = MevBundle {
        bundle_id: Some(bundle_id.clone()),
        block_date: mev_bundle[0].block_date.clone(),
        block_time: mev_bundle[0].block_time,
        block_slot: mev_bundle[0].block_slot,
        signer: mev_bundle[0].signer.clone(),
        trader: mev_bundle[0].trader.clone(),
        mev_type: mev_type as i32,
        trades: mev_bundle.iter().map(|trade| {
            let mut trade = trade.clone();
            trade.bundle_id = Some(bundle_id.clone());
            trade
        }).collect(),
    };

    return bundle;
}
