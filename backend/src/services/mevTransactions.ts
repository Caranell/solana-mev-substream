import { Trade } from "@prisma/client";
import { MevBundle } from "@prisma/client";
import db from "./database";

type MevBundleWithTrades = MevBundle & {
  trades: Trade[];
};

type MevBundleWithProfit = MevBundle & {
  profit: number;
};

const getLatestBundle = async () => {
  const latestBundle = await db.getLatestBundle();

  return latestBundle;
};

const getMEVBundles = async ({ period, mevType, limit, offset }) => {
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

const calculateBundleProfit = (bundle: MevBundleWithTrades) => {
  if (bundle.mevType === "ARBITRAGE") {
    return calculateArbitrageProfit(bundle);
  }

  return calculateSanwichProfit(bundle);
};

const getTopSearchers = (bundles: MevBundleWithProfit[]) => {
  const signerProfit = bundles.reduce((acc, bundle) => {
    acc[bundle.signer] = (acc[bundle.signer] || 0) + bundle.profit;
    return acc;
  }, {} as Record<string, number>);

  return signerProfit;
};

const getTopBundles = (bundles: MevBundleWithProfit[]) => {
  const sortedBundles = bundles.sort((a, b) => b.profit - a.profit);

  return sortedBundles;
};

const getTopArbitrageBundles = (bundles: MevBundleWithTrades[]) => {
  const bundlesWithProfit = bundles.map((bundle) => {
    return {
      ...bundle,
      profit: calculateArbitrageProfit(bundle),
    };
  });

  const sortedBundles = bundlesWithProfit.sort((a, b) => b.profit - a.profit);

  return sortedBundles;
};

const getTopSanwichBundles = (bundles: MevBundleWithTrades[]) => {
  const bundlesWithProfit = bundles.map((bundle) => {
    return {
      ...bundle,
      profit: calculateSanwichProfit(bundle),
    };
  });

  const sortedBundles = bundlesWithProfit.sort((a, b) => b.profit - a.profit);

  return sortedBundles;
};

const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

const calculateArbitrageProfit = (bundle: MevBundleWithTrades) => {
  const { trades } = bundle;

  const sortedTrades = trades.toSorted(
    (a, b) => a.innerInstructionIndex - b.innerInstructionIndex
  );

  const firstTrade = sortedTrades[0];
  const lastTrade = sortedTrades[sortedTrades.length - 1];

  let solSpent =
    firstTrade.baseMint === SOL_ADDRESS
      ? firstTrade.baseAmount
      : firstTrade.quoteAmount;
  let solReceived =
    lastTrade.baseMint === SOL_ADDRESS
      ? lastTrade.baseAmount
      : lastTrade.quoteAmount;

  const profit = Math.abs(solReceived) - Math.abs(solSpent);

  return profit;
};

const calculateSanwichProfit = (bundle: MevBundleWithTrades) => {
  const { trades } = bundle;

  const sortedTrades = trades.toSorted((a, b) => a.txIndex - b.txIndex);

  const firstTrade = sortedTrades[0];
  const lastTrade = sortedTrades[sortedTrades.length - 1];

  const solSpent =
    firstTrade.baseMint === SOL_ADDRESS
      ? firstTrade.baseAmount
      : firstTrade.quoteAmount;
  const solReceived =
    lastTrade.baseMint === SOL_ADDRESS
      ? lastTrade.baseAmount
      : lastTrade.quoteAmount;

  const profit = Math.abs(solReceived) - Math.abs(solSpent);

  return profit;
};

const getBundlesStatistics = ({
  bundles,
  mevType,
}: {
  bundles: MevBundleWithTrades[];
  mevType: string;
}) => {
  // # of bundles/transactions
  // cost
  // revenue
  // senders
  // programs
  // victims?
  // TOP POOLS
};

const getArbitrageBundlesStatistics = (bundles: MevBundleWithTrades[]) => {
  // average transactions per bundle
};

const getSanwichBundlesStatistics = (bundles: MevBundleWithTrades[]) => {};
