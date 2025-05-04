#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(non_snake_case)]

mod pb;
// mod utils;

use pb::caranell::solana::mev::bundles::v1::{MevBundle, Output, TradeData};

#[substreams::handlers::map]
fn map_trades(trades: TradeData) -> Result<Output, substreams::errors::Error> {
    let mev_bundles = find_mev_bundles(vec![trades]);

    return Ok(Output {
        bundles: mev_bundles,
    });
}

fn find_mev_bundles(trade_data: Vec<TradeData>) -> Vec<MevBundle> {
    let mut arbitrage_bundles: Vec<Vec<TradeData>> = Vec::new();
    let mut sandwich_bundles: Vec<Vec<TradeData>> = Vec::new();

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
                sandwich_bundles.push(vec![trade_a.clone(), trade_b.clone(), trade_c.clone()]);
            }
        }
    }

    let mut formatted_bundles = Vec::new();
    formatted_bundles.extend(
        arbitrage_bundles
            .iter()
            .map(|bundle| format_bundle(bundle, "arbitrage".to_string()))
            .collect::<Vec<_>>(),
    );
    formatted_bundles.extend(
        sandwich_bundles
            .iter()
            .map(|bundle| format_bundle(bundle, "sandwich".to_string()))
            .collect::<Vec<_>>(),
    );

    return formatted_bundles;
}

fn is_same_transaction(trade: &TradeData, prev_trade: &TradeData) -> bool {
    if trade.tx_index == prev_trade.tx_index && trade.signer == prev_trade.signer {
        return true;
    }

    return false;
}

fn format_bundle(mev_bundle: &Vec<TradeData>, mev_type: String) -> MevBundle {
    let bundle = MevBundle {
        block_date: mev_bundle[0].block_date.clone(),
        block_time: mev_bundle[0].block_time,
        block_slot: mev_bundle[0].block_slot,
        signer: mev_bundle[0].signer.clone(),
        trader: mev_bundle[0].trader.clone(),
        mev_type: mev_type,
        trades: mev_bundle.clone(),
    };

    return bundle;
}
