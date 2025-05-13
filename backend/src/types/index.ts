import { MevBundle } from "@prisma/client";
import { Trade } from "@prisma/client";

export type MevBundleWithTrades = MevBundle & {
  trades: Trade[];
};

export type MevBundleWithProfit = MevBundleWithTrades & {
  profit: number;
};