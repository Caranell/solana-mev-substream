use crate::pb::solana::mev::bundles::v1::{MevBundle, MevType, TradeData};

pub fn is_same_transaction(trade: &TradeData, prev_trade: &TradeData) -> bool {
  if trade.tx_index == prev_trade.tx_index && trade.signer == prev_trade.signer {
      return true;
  }

  return false;
}

pub fn is_valid_arbitrage_sequence(sequence: &Vec<TradeData>) -> bool {
  if sequence.len()<2 {
    return false;
  }

  if !sequence.iter().all(|trade| trade.is_inner_instruction && trade.signer == trade.trader) {
    return false;
  }

  return true;
}

pub fn format_bundle(mev_bundle: &Vec<TradeData>, mev_type: MevType) -> MevBundle {
  let bundle = MevBundle {
      block_date: mev_bundle[0].block_date.clone(),
      block_time: mev_bundle[0].block_time,
      block_slot: mev_bundle[0].block_slot,
      signer: mev_bundle[0].signer.clone(),
      trader: mev_bundle[0].trader.clone(),
      mev_type: mev_type as i32,
      trades: mev_bundle.clone(),
  };

  return bundle;
}
