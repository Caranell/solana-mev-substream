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

fn find_mev_bundles(trade_data: Vec<TradeData>) -> () {
    let mut mev_bundles = Vec::new();

    let mut arbitrage_bundles = Vec::new();

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

    return ();
}

fn is_same_transaction(trade: &TradeData, prev_trade: &TradeData) -> bool {
    if trade.tx_index == prev_trade.tx_index && trade.signer == prev_trade.signer {
        return true;
    }

    return false;
}


fn process_mev_trades(trade_data: Vec<TradeData>) -> Vec<MevBundle> {
    let mut mev_trades = HashMap::new();
    for trade in trade_data {
        let signer = trade.signer.clone();
        let signer_trades = mev_trades.entry(signer).or_insert(vec![]);

        signer_trades.push(trade);
    }

    // filter out signers with only 1 trade
    mev_trades.retain(|_, trades| trades.len() > 1);

    let mut arbitrage_trades = Vec::new();
    for (signer, trades) in mev_trades {
        let trades = trades.clone();

        // group trades by tx_index
        let mut trades_by_tx_index = HashMap::new();
        for trade in trades {
            let tx_index = trade.tx_index;
            let trade_data = trades_by_tx_index.entry(tx_index).or_insert(vec![]);
            trade_data.push(trade);
        }

        // for each tx_index, if there're multiple trades, it's arbitrage
        for (tx_index, trades) in trades_by_tx_index {
            if trades.len() > 1 {
                let result = get_arbitrage_summary(trades);
                arbitrage_trades.push(result);
            }
        }
    }

    return arbitrage_trades;
}