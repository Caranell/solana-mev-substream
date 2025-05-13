import db from "./database";
import {
  calculateBundleProfit,
  getTopArbitragePrograms,
  getTopArbitrageTokens,
  getTopBundles,
  getTopSandwichPools,
  getTopSearchers,
} from "./utils";
import {
  ArbitrageStatistics,
  BaseBundlesStatistics,
  MevBundleWithProfit,
  SandwichStatistics,
} from "../types";
import { MevBundle } from "@prisma/client";

interface GetMEVBundlesParams {
  period: string;
  mevType: string;
  limit: number;
  offset: number;
}

// Combined types for the complete return type
type ArbitrageBundlesStatistics = BaseBundlesStatistics & ArbitrageStatistics;
type SandwichBundlesStatistics = BaseBundlesStatistics & SandwichStatistics;
type BundlesStatistics = ArbitrageBundlesStatistics | SandwichBundlesStatistics;

const getLatestBundle = async (): Promise<MevBundle | null> => {
  const latestBundle = await db.getLatestBundle();

  return latestBundle;
};

const getMEVBundles = async ({
  period,
  mevType,
  limit,
  offset,
}: GetMEVBundlesParams): Promise<MevBundleWithProfit[]> => {
  const mevBundles = await db.getMEVBundles({
    period,
    mevType,
    limit,
    offset,
  });

  const bundlesWithProfit = mevBundles.map((bundle) => {
    return {
      ...bundle,
      profit: calculateBundleProfit(bundle),
    };
  });

  return bundlesWithProfit;
};

const getBundlesStatistics = ({
  bundles,
  mevType,
}: {
  bundles: MevBundleWithProfit[];
  mevType: string;
}): BundlesStatistics => {
  const baseStats: BaseBundlesStatistics = {
    numberOfBundles: bundles.length,
    numberOfTransactions: bundles.reduce(
      (acc, bundle) => acc + bundle.trades.length,
      0
    ),
    totalProfit: bundles.reduce((acc, bundle) => acc + bundle.profit, 0),
    uniqueSenders: Array.from(new Set(bundles.map((bundle) => bundle.signer)))
      .length,
    topSearchers: getTopSearchers(bundles),
    topBundles: getTopBundles(bundles),
  };

  if (mevType === "ARBITRAGE") {
    const arbStats = getArbitrageBundlesStatistics(bundles);
    return {
      ...baseStats,
      ...arbStats,
    } as ArbitrageBundlesStatistics;
  } else {
    const sandwichStats = getSanwichBundlesStatistics(bundles);
    return {
      ...baseStats,
      ...sandwichStats,
    } as SandwichBundlesStatistics;
  }
};

const getArbitrageBundlesStatistics = (
  bundles: MevBundleWithProfit[]
): ArbitrageStatistics => {
  const averageNumberOfTransactions =
    bundles.reduce((acc, bundle) => acc + bundle.trades.length, 0) /
    bundles.length;

  const topArbitrageTokens = getTopArbitrageTokens(bundles);
  const topArbitragePrograms = getTopArbitragePrograms(bundles);

  return {
    averageNumberOfTransactions,
    topArbitrageTokens,
    topArbitragePrograms,
  };
};

const getSanwichBundlesStatistics = (
  bundles: MevBundleWithProfit[]
): SandwichStatistics => {
  const uniqueVictims = Array.from(
    new Set(
      bundles.map((bundle) => {
        const trades = bundle.trades.toSorted((a, b) => a.txIndex - b.txIndex);
        const victim = trades[1].signer;

        return victim;
      })
    )
  ).length;

  const uniqueAttackers = Array.from(
    new Set(
      bundles.map((bundle) => {
        const trades = bundle.trades.toSorted((a, b) => a.txIndex - b.txIndex);
        const attacker = trades[0].signer;

        return attacker;
      })
    )
  ).length;

  const topSandwichPools = getTopSandwichPools(bundles);

  return {
    victims: uniqueVictims,
    attackers: uniqueAttackers,
    topSandwichPools,
  };
};

export default {
  getLatestBundle,
  getMEVBundles,
  getBundlesStatistics,
};
