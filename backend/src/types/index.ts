import { MevBundle } from "@prisma/client";
import { Trade } from "@prisma/client";
import { SearcherProfit, TokenPopularity, ProgramPopularity, PoolProfit } from "../services/utils";

export type MevBundleWithTrades = MevBundle & {
  trades: Trade[];
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
}

export interface SandwichStatistics {
  victims: number;
  attackers: number;
  topSandwichPools: PoolProfit[];
}

export type ArbitrageBundlesStatistics = BaseBundlesStatistics & ArbitrageStatistics;
export type SandwichBundlesStatistics = BaseBundlesStatistics & SandwichStatistics;
export type BundlesStatistics = ArbitrageBundlesStatistics | SandwichBundlesStatistics;
