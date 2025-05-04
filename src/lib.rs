#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(non_snake_case)]

mod pb;
// mod utils;

use std::collections::HashMap;

use pb::caranell::solana::mev::bundles::v1::{MevBundle, Output, TradeData};

#[substreams::handlers::map]
fn map_trades(trades: Vec<TradeData>) -> Result<Output, substreams::errors::Error> {
    let mev_bundles = find_mev_bundles(trades);

    return Ok(Output {
        bundles: mev_bundles,
    });
}

fn find_mev_bundles(trade_data: Vec<TradeData>) -> Vec<MevBundle> {
    let mut arbitrage_bundles = Vec::new();
    let mut sandwich_bundles = Vec::new();

    let mut arbitrage_sequence: Vec<TradeData> = Vec::new();
    let mut arbitrage_sequence_broken = true;

    for (idx, trade) in trade_data.iter().enumerate() {
        if let Some(prev_trade) = arbitrage_sequence.last() {
            if is_same_transaction(trade, prev_trade) {
                arbitrage_sequence.push(trade.clone());
                arbitrage_sequence_broken = false;
            }
        } else {
            // it's potential first trade in a sequence
            arbitrage_sequence.push(trade.clone());
            arbitrage_sequence_broken = false;
        }

        if arbitrage_sequence_broken {
            // sequence broken, check if the completed sequence was an arbitrage (>= 2 trades)
            if arbitrage_sequence.len() > 1 {
                arbitrage_bundles.push(arbitrage_sequence);
                break;
            }

            arbitrage_sequence = vec![trade.clone()];
        }

        // Sandwich detection
        if idx >= 2 {
            let trade_a = &trade_data[idx - 2];
            let trade_b = &trade_data[idx - 1];
            let trade_c = &trade_data[idx];

            // Core sandwich condition: A and C have same signer, different from B's signer
            if trade_a.signer == trade_c.signer && trade_a.signer != trade_b.signer {
                arbitrage_bundles.push(vec![trade_a.clone(), trade_b.clone(), trade_c.clone()]);
            }
        }
    }

    let block_date = trade_data[0].block_date.clone();
    let block_time = trade_data[0].block_time;
    let block_slot = trade_data[0].block_slot;

    let formatted_arbitrage_bundles = arbitrage_bundles
        .iter()
        .map(|bundle| format_arbitrage_bundle(bundle, block_date, block_time, block_slot))
        .collect();





}

fn is_same_transaction(trade: &TradeData, prev_trade: &TradeData) -> bool {
    if trade.tx_index == prev_trade.tx_index && trade.signer == prev_trade.signer {
        return true;
    }

    return false;
}

fn format_arbitrage_bundle(
    arbitrage_trades: Vec<TradeData>,
    block_date: String,
    block_time: i64,
    block_slot: u64,
) -> MevBundle {
    let bundle = MevBundle {
        block_date: block_date,
        block_time: block_time,
        block_slot: block_slot,
        signer: arbitrage_trades[0].signer.clone(),
        trader: arbitrage_trades[0].trader.clone(),
        mev_type: "arbitrage".to_string(),
        trades: arbitrage_trades,
    };

    return bundle;
}

fn format_sandwich_bundle(
    sandwich_trades: Vec<TradeData>,
    block_date: String,
    block_time: i64,
    block_slot: u64,
) -> MevBundle {
    let bundle = MevBundle {
        block_date: block_date,
        block_time: block_time,
        block_slot: block_slot,
        signer: sandwich_trades[0].signer.clone(),
        trader: sandwich_trades[0].trader.clone(),
        mev_type: "sandwich".to_string(),
        trades: sandwich_trades,
    };

    return bundle;
}
