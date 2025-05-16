CREATE TABLE IF NOT EXISTS "mev_bundles" (
  "id" TEXT PRIMARY KEY,
  "bundle_id" TEXT NOT NULL, -- Unique identifier for the bundle
  "block_date" TEXT NOT NULL,
  "block_time" BIGINT NOT NULL,
  "block_slot" BIGINT NOT NULL,
  "signer" TEXT NOT NULL, -- Signer of the bundle
  "trader" TEXT NOT NULL, -- Trader associated with the bundle
  "mev_type" TEXT NOT NULL, -- Type of MEV (e.g., ARBITRAGE, SANDWICH)
  "profit" DOUBLE PRECISION NOT NULL
);

CREATE TABLE trades (
  "id" TEXT PRIMARY KEY,
  "bundle_id" TEXT NOT NULL,
  "block_date" TEXT NOT NULL,
  "block_time" BIGINT NOT NULL,
  "block_slot" BIGINT NOT NULL,
  "tx_id" TEXT NOT NULL,
  "tx_index" BIGINT NOT NULL,
  "signer" TEXT NOT NULL,
  "pool_address" TEXT NOT NULL,
  "base_mint" TEXT NOT NULL,
  "quote_mint" TEXT NOT NULL,
  "base_vault" TEXT NOT NULL,
  "quote_vault" TEXT NOT NULL,
  "base_amount" DOUBLE PRECISION NOT NULL,
  "quote_amount" DOUBLE PRECISION NOT NULL,
  "is_inner_instruction" BOOLEAN NOT NULL,
  "instruction_index" INTEGER NOT NULL,
  "instruction_type" TEXT NOT NULL,
  "inner_instruction_index" INTEGER NOT NULL, -- Assuming 0 if not an inner instruction
  "outer_program" TEXT NOT NULL,
  "inner_program" TEXT NOT NULL, -- Could be empty if not an inner instruction
  "txn_fee_lamports" BIGINT NOT NULL,
  "signer_lamports_change" BIGINT NOT NULL,
  "trader" TEXT NOT NULL,
  "outer_executing_accounts" TEXT[], -- Array of TEXT
  "trader_lamports_change" BIGINT NOT NULL,
  "trader_token_balance_changes" JSONB -- JSON string array of trader token balance changes
);