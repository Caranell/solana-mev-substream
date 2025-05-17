import db from "./database";
import {
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
  SandwichBundlesStatistics,
  ArbitrageBundlesStatistics,
  SandwichStatistics,
  GetMEVBundlesParams,
  MevBundleWithTrades,
} from "../types";
import { MevBundle } from "@prisma/client";
import { getTokensMetadata } from "./helius";

const getLatestBundle = async (): Promise<MevBundleWithTrades | null> => {
  const latestBundle = await db.getLatestBundle();

  return latestBundle;
};

const getMEVBundles = async ({
  period,
  mevType,
  limit,
  offset,
  orderBy,
  orderDirection,
  noLimit,
}: GetMEVBundlesParams): Promise<MevBundleWithTrades[]> => {
  const mevBundles = await db.getMEVBundles({
    period,
    mevType,
    limit,
    offset,
    orderBy,
    orderDirection,
    noLimit,
  });

  return mevBundles;
};

const fillMissingTokens = async (bundles: MevBundleWithTrades[]) => {
  const uniqueTokens = Array.from(
    new Set(
      bundles
        .flatMap((bundle) =>
          bundle.trades.map((trade) => [trade.baseMint, trade.quoteMint])
        )
        .flat()
    )
  );

  const dbTokens = await db.getTokens(uniqueTokens);

  const unknownTokens = uniqueTokens.filter(
    (token) => !dbTokens.find((dbToken) => dbToken.address === token)
  );

  if (unknownTokens.length === 0) {
    return dbTokens
  }

  console.log("unknownTokens", unknownTokens);

  const tokensMetadata = await getTokensMetadata(unknownTokens);

  await db.createTokens(tokensMetadata);

  return tokensMetadata;
};

const getBundlesStatistics = async (
  bundles: MevBundleWithTrades[]
): Promise<BundlesStatistics> => {
  console.log("getting stats");
  if (bundles.length === 0) {
    return {} as BundlesStatistics;
  }

  const mevType = bundles[0].mevType;

  console.log("mevType", mevType);

  console.log("BUNDLES", bundles.length);

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
    const sandwichStats = await getSanwichBundlesStatistics(bundles);
    return {
      ...baseStats,
      ...sandwichStats,
    } as SandwichBundlesStatistics;
  }
};

const getArbitrageBundlesStatistics = (
  bundles: MevBundleWithTrades[]
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

const getSanwichBundlesStatistics = async (
  bundles: MevBundleWithTrades[]
): Promise<SandwichStatistics> => {
  const uniqueVictims = Array.from(
    new Set(
      bundles.map((bundle) => {
        const trades = bundle.trades.sort((a, b) => a.txIndex - b.txIndex);
        const victim = trades[1].signer;

        return victim;
      })
    )
  ).length;

  const uniqueAttackers = Array.from(
    new Set(
      bundles.map((bundle) => {
        const trades = bundle.trades.sort((a, b) => a.txIndex - b.txIndex);
        const attacker = trades[0].signer;

        return attacker;
      })
    )
  ).length;

  const topSandwichPools = await getTopSandwichPools(bundles);

  return {
    victims: uniqueVictims,
    attackers: uniqueAttackers,
    topSandwichPools: topSandwichPools.slice(0, 10),
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
  fillMissingTokens,
};
