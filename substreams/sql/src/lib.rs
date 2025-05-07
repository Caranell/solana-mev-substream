mod pb;

use crate::pb::solana::mev::bundles::v1::Output;
use pb::solana::mev::bundles::v1::{MevBundle, TradeData};
use substreams_database_change::pb::database::{table_change::Operation, DatabaseChanges};

#[substreams::handlers::map]
fn db_out(input: Output) -> Result<DatabaseChanges, substreams::errors::Error> {
    let mut database_changes: DatabaseChanges = Default::default();
    let mev_bundles = input.data;

    let mut change_index = 0;

    get_db_changes_from_bundles(mev_bundles, &mut database_changes, &mut change_index);

    Ok(database_changes)
}

fn get_db_changes_from_bundles(
    bundles: Vec<MevBundle>,
    database_changes: &mut DatabaseChanges,
    change_index: &mut u64,
) {
    for bundle in bundles {
        create_db_changes_for_bundle(bundle, database_changes, change_index);
    }
}

fn create_db_changes_for_bundle(
    bundle: MevBundle,
    database_changes: &mut DatabaseChanges,
    change_index: &mut u64,
) {
    let bundle_id = bundle.bundle_id.unwrap();

    database_changes
        .push_change(
            "mev_bundles",
            bundle_id.clone(),
            *change_index,
            Operation::Create,
        )
        .change("bundle_id", (None, bundle_id.clone()))
        .change("block_date", (None, bundle.block_date))
        .change("block_time", (None, bundle.block_time))
        .change("block_slot", (None, bundle.block_slot))
        .change("signer", (None, bundle.signer))
        .change("trader", (None, bundle.trader))
        .change("mev_type", (None, bundle.mev_type));

    *change_index += 1;

    for trade in bundle.trades {
        create_db_changes_for_trade(trade, database_changes, change_index);
    }
}

fn create_db_changes_for_trade(
    trade: TradeData,
    database_changes: &mut DatabaseChanges,
    change_index: &mut u64,
) {
    let pk = format!("{}{}", trade.tx_id, trade.inner_instruction_index);

    database_changes
        .push_change("trades", pk, *change_index, Operation::Create)
        .change("bundle_id", (None, trade.bundle_id.unwrap()))
        .change("block_date", (None, trade.block_date))
        .change("block_time", (None, trade.block_time))
        .change("block_slot", (None, trade.block_slot))
        .change("tx_id", (None, trade.tx_id))
        .change("tx_index", (None, trade.tx_index))
        .change("signer", (None, trade.signer))
        .change("pool_address", (None, trade.pool_address))
        .change("base_mint", (None, trade.base_mint))
        .change("quote_mint", (None, trade.quote_mint))
        .change("base_vault", (None, trade.base_vault))
        .change("quote_vault", (None, trade.quote_vault))
        .change("base_amount", (None, trade.base_amount.to_string()))
        .change("quote_amount", (None, trade.quote_amount.to_string()))
        .change("is_inner_instruction", (None, trade.is_inner_instruction))
        .change("instruction_index", (None, trade.instruction_index))
        .change("instruction_type", (None, trade.instruction_type))
        .change(
            "inner_instruction_index",
            (None, trade.inner_instruction_index),
        )
        .change("outer_program", (None, trade.outer_program))
        .change("inner_program", (None, trade.inner_program))
        .change("txn_fee_lamports", (None, trade.txn_fee_lamports))
        .change(
            "signer_lamports_change",
            (None, trade.signer_lamports_change),
        )
        .change("trader", (None, trade.trader))
        // .change(
        //     "outer_executing_accounts",
        //     (None, trade.outer_executing_accounts.join(",")),
        // )
        .change(
            "trader_lamports_change",
            (None, trade.trader_lamports_change),
        );
    // .change(
    //     "trader_token_balance_changes",
    //     (None, trade.trader_token_balance_changes),
    // );

    *change_index += 1;
}
