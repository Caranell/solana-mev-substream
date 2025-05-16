import db from "./database";
import {
  calculateBundleProfit,
  getTopArbitragePrograms,
  getTopArbitrageTokens,
  getTopBundles,
  getTopSandwichPools,
  getTopSearchers,
  getUniqueArbitragePrograms,
} from "./utils";
import {
  ArbitrageStatistics,
  BaseBundlesStatistics,
  BundlesStatistics,
  MevBundleWithProfit,
  SandwichBundlesStatistics,
  ArbitrageBundlesStatistics,
  SandwichStatistics,
  GetMEVBundlesParams,
} from "../types";
import { MevBundle } from "@prisma/client";

const getLatestBundle = async (): Promise<MevBundleWithProfit> => {
  const latestBundle = await db.getLatestBundle();

  const bundleWithProfit = {
    ...latestBundle,
    profit: calculateBundleProfit(latestBundle),
  };

  return bundleWithProfit;
};

const getMEVBundles = async ({
  period,
  mevType,
  limit,
  offset,
  orderBy,
  orderDirection,
  noLimit,
}: GetMEVBundlesParams): Promise<MevBundleWithProfit[]> => {
  const mevBundles = await db.getMEVBundles({
    period,
    mevType,
    limit,
    offset,
    orderBy,
    orderDirection,
    noLimit,
  });

  const bundlesWithProfit = await Promise.all(
    mevBundles.map(async (bundle) => {
      const tradesWithTokens = await Promise.all(
        bundle.trades.map(async (trade) => {
          const baseToken = await db.getTokenSymbol(trade.baseMint);
          const quoteToken = await db.getTokenSymbol(trade.quoteMint);

          return {
            ...trade,
            baseTokenSymbol: baseToken,
            quoteTokenSymbol: quoteToken,
          };
        })
      );

      return {
        ...bundle,
        trades: tradesWithTokens,
        profit: calculateBundleProfit(bundle),
      };
    })
  );

  return bundlesWithProfit;


  // const filteredBundles = bundlesWithProfit.filter((bundle) => {
  //   return bundle.profit > 0;
  // });

  // return filteredBundles;
};

const getBundlesStatistics = (
  bundles: MevBundleWithProfit[]
): BundlesStatistics => {
  if (bundles.length === 0) {
    return {} as BundlesStatistics;
  }

  const mevType = bundles[0].mevType;

  console.log("mevType", mevType);

  const baseStats: BaseBundlesStatistics = {
    numberOfBundles: bundles.length,
    numberOfTransactions: bundles.reduce(
      (acc, bundle) => acc + bundle.trades.length,
      0
    ),
    totalProfit: bundles.reduce((acc, bundle) => acc + bundle.profit, 0),
    uniqueSenders: Array.from(new Set(bundles.map((bundle) => bundle.signer)))
      .length,
    topSearchers: getTopSearchers(bundles).slice(0, 10),
    topBundles: getTopBundles(bundles).slice(0, 10),
  };

  if (mevType === "1") {
    const arbStats = getArbitrageBundlesStatistics(bundles);
    console.log("arbStats", arbStats);
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

  const topArbitrageTokens = getTopArbitrageTokens(bundles).slice(0, 10);
  const topArbitragePrograms = getTopArbitragePrograms(bundles).slice(0, 10);
  const uniqueArbitragePrograms = getUniqueArbitragePrograms(bundles);

  return {
    averageNumberOfTransactions,
    topArbitrageTokens,
    topArbitragePrograms,
    uniqueArbitragePrograms,
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

  const topSandwichPools = getTopSandwichPools(bundles).slice(0, 10);

  return {
    victims: uniqueVictims,
    attackers: uniqueAttackers,
    topSandwichPools,
  };
};

let lastBundleCacheId: string | null = null;

const checkForNewBundles = async () => {
  const latestBundle = await getLatestBundle();

  if (latestBundle && latestBundle.bundleId !== lastBundleCacheId) {
    lastBundleCacheId = latestBundle.bundleId;
    return latestBundle;
  }

  return null;
};

export default {
  getLatestBundle,
  getMEVBundles,
  getBundlesStatistics,
  checkForNewBundles,
};
