use std::collections::HashSet;

use sha2::{Digest, Sha256};

use crate::pb::solana::mev::bundles::v1::{MevBundle, MevType, TradeData};

const WSOL_ADDRESS: &str = "So11111111111111111111111111111111111111112";

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
    // so the values of 2 or 3 are possible & valid
    if unique_traded_tokens.len() == 4 {
        return false;
    }

    // atm we're only handling atomic arbs with SOL as base token
    if (first_trade.base_mint != WSOL_ADDRESS && first_trade.quote_mint != WSOL_ADDRESS)
        || (last_trade.base_mint != WSOL_ADDRESS && last_trade.quote_mint != WSOL_ADDRESS)
    {
        return false;
    }

    if (first_trade.base_mint == WSOL_ADDRESS && first_trade.base_amount > 0.0)
        || (first_trade.quote_mint == WSOL_ADDRESS && first_trade.quote_amount > 0.0)
    {
        return false;
    }

    if (last_trade.base_mint == WSOL_ADDRESS && last_trade.base_amount < 0.0)
        || (last_trade.quote_mint == WSOL_ADDRESS && last_trade.quote_amount < 0.0)
    {
        return false;
    }

    return true;
}

pub fn is_sandwich_sequence(trade_a: &TradeData, trade_b: &TradeData, trade_c: &TradeData) -> bool {
    // By "MEV sanwich" defenition, first & last trades are made by same signer, while in the middle is their "victim"
    if trade_a.signer != trade_c.signer || trade_a.signer == trade_b.signer {
        return false;
    }

    // sandwich trades should use the same pool
    if trade_a.pool_address != trade_b.pool_address || trade_b.pool_address != trade_c.pool_address
    {
        return false;
    }

    if !is_same_token_amount_traded(&trade_a, &trade_c) {
        return false;
    }

    if !is_sol_amount_correct(&trade_a, &trade_c) {
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
    if unique_traded_tokens.len() != 2 {
        return false;
    }

    return true;
}

fn is_same_token_amount_traded(trade_a: &TradeData, trade_c: &TradeData) -> bool {
    let token_amount_first_trade = if trade_a.base_mint == WSOL_ADDRESS {
        trade_a.quote_amount
    } else {
        trade_a.base_amount
    };

    let token_amount_last_trade = if trade_c.base_mint == WSOL_ADDRESS {
        trade_c.quote_amount
    } else {
        trade_c.base_amount
    };

    return token_amount_first_trade.abs() == token_amount_last_trade.abs();
}

fn is_sol_amount_correct(trade_a: &TradeData, trade_c: &TradeData) -> bool {
    let sol_amount_first_trade = if trade_a.base_mint == WSOL_ADDRESS {
        trade_a.base_amount
    } else {
        trade_a.quote_amount
    };

    let sol_amount_last_trade = if trade_c.base_mint == WSOL_ADDRESS {
        trade_c.base_amount
    } else {
        trade_c.quote_amount
    };

    return sol_amount_first_trade < 0.0 && sol_amount_last_trade > 0.0;
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
        trades: mev_bundle
            .iter()
            .map(|trade| {
                let mut trade = trade.clone();
                trade.bundle_id = Some(bundle_id.clone());
                trade
            })
            .collect(),
    };

    return bundle;
}
