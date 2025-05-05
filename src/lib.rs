mod pb;
mod utils;

use pb::solana::mev::bundles::v1::{DexTradesOutput, MevBundle, MevType, Output, TradeData};
use utils::{format_bundle, is_same_transaction};

#[substreams::handlers::map]
fn map_dex_trades(dex_trades_data: DexTradesOutput) -> Result<Output, substreams::errors::Error> {
    let dex_trades = dex_trades_data.data;
    let mev_bundles = find_mev_bundles(&dex_trades);

    return Ok(Output { data: mev_bundles });
}

fn find_mev_bundles(trade_data: &[TradeData]) -> Vec<MevBundle> {
    let mut arbitrage_bundles: Vec<Vec<TradeData>> = Vec::new();
    let mut sandwich_bundles: Vec<Vec<TradeData>> = Vec::new();

    let mut arbitrage_sequence: Vec<TradeData> = Vec::new();

    for (idx, trade) in trade_data.iter().enumerate() {
        if let Some(prev_trade) = arbitrage_sequence.last() {
            if is_same_transaction(trade, prev_trade) {
                arbitrage_sequence.push(trade.clone());
            } else {
                if arbitrage_sequence.len() > 1 {
                    arbitrage_bundles.push(arbitrage_sequence.clone());
                } else {
                    arbitrage_sequence.clear();
                }
                arbitrage_sequence.push(trade.clone());
            }
        } else {
            arbitrage_sequence.push(trade.clone());
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

    let mut formatted_bundles: Vec<MevBundle> = Vec::new();
    formatted_bundles.extend(
        arbitrage_bundles
            .iter()
            .map(|bundle| {
                format_bundle(
                    bundle,
                    MevType::from_str_name(MevType::Arbitrage.as_str_name()).unwrap(),
                )
            })
            .collect::<Vec<_>>(),
    );
    formatted_bundles.extend(
        sandwich_bundles
            .iter()
            .map(|bundle| {
                format_bundle(
                    bundle,
                    MevType::from_str_name(MevType::Sandwich.as_str_name()).unwrap(),
                )
            })
            .collect::<Vec<_>>(),
    );

    return formatted_bundles;
}
