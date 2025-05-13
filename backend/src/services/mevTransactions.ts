import db from "./database";
import { calculateBundleProfit, getTopArbitragePrograms, getTopArbitrageTokens, getTopBundles, getTopSandwichPools, getTopSearchers } from "./utils";
import { MevBundleWithProfit } from "../types";

interface GetMEVBundlesParams {
  period: string;
  mevType: string;
  limit: number;
  offset: number;
}

const getLatestBundle = async () => {
  const latestBundle = await db.getLatestBundle();

  return latestBundle;
};

const getMEVBundles = async ({ period, mevType, limit, offset }: GetMEVBundlesParams) => {
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
}) => {
  const numberOfBundles = bundles.length;
  const numberOfTransactions = bundles.reduce(
    (acc, bundle) => acc + bundle.trades.length,
    0
  );
  const totalProfit = bundles.reduce((acc, bundle) => acc + bundle.profit, 0);
  const uniqueSenders = Array.from(
    new Set(bundles.map((bundle) => bundle.signer))
  ).length;

  const topSearchers = getTopSearchers(bundles);
  const topBundles = getTopBundles(bundles);

  let rest = {};
  if (mevType === "ARBITRAGE") {
    rest = getArbitrageBundlesStatistics(bundles);
  } else {
    rest = getSanwichBundlesStatistics(bundles);
  }

  return {
    numberOfBundles,
    numberOfTransactions,
    totalProfit,
    uniqueSenders,
    topSearchers,
    topBundles,
    ...rest,
  };
};

const getArbitrageBundlesStatistics = (bundles: MevBundleWithProfit[]) => {
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

const getSanwichBundlesStatistics = (bundles: MevBundleWithProfit[]) => {
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
