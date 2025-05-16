import { MevBundle } from "@prisma/client";
import { Trade } from "@prisma/client";

export interface PoolProfit {
  pool: string;
  profit: number;
}
export interface SearcherProfit {
  searcherAddress: string;
  profit: number;
}
export interface ProgramPopularity {
  program: string;
  profit: number;
}

export interface TokenPopularity {
  token: string;
  profit: number;
}

export type TradeWithTokens = Trade & {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
};

export type MevBundleWithTrades = MevBundle & {
  trades: TradeWithTokens[];
};

export type MevBundleWithProfit = MevBundleWithTrades & {
  profit: number;
};

// Common fields for all bundle statistics
export interface BaseBundlesStatistics {
  numberOfBundles: number;
  numberOfTransactions: number;
  totalProfit: number;
  uniqueSenders: number;
  topSearchers: SearcherProfit[];
  topBundles: MevBundleWithProfit[];
}

export interface ArbitrageStatistics {
  averageNumberOfTransactions: number;
  topArbitrageTokens: TokenPopularity[];
  topArbitragePrograms: ProgramPopularity[];
  uniqueArbitragePrograms: number;
}

export interface SandwichStatistics {
  victims: number;
  attackers: number;
  topSandwichPools: PoolProfit[];
}

export type ArbitrageBundlesStatistics = BaseBundlesStatistics &
  ArbitrageStatistics;
export type SandwichBundlesStatistics = BaseBundlesStatistics &
  SandwichStatistics;
export type BundlesStatistics =
  | ArbitrageBundlesStatistics
  | SandwichBundlesStatistics;

export interface GetMEVBundlesParams {
  period?: string;
  mevType?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: string;
  noLimit?: boolean;
}
