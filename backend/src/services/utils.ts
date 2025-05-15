import { MevBundleWithProfit, MevBundleWithTrades } from "../types";
import {
  KNOWN_AMM_PROGRAMS_TRAITS,
  SOL_ADDRESS,
  USDC_ADDRESS,
} from "../constants";

export const calculateBundleProfit = (bundle: MevBundleWithTrades): number => {
  if (bundle.mevType === "1") {
    return calculateArbitrageProfit(bundle);
  }

  return calculateSanwichProfit(bundle);
};

const calculateArbitrageProfit = (bundle: MevBundleWithTrades): number => {
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

const calculateSanwichProfit = (bundle: MevBundleWithTrades): number => {
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

export interface SearcherProfit {
  searcherAddress: string;
  profit: number;
}

export const getTopSearchers = (
  bundles: MevBundleWithProfit[]
): SearcherProfit[] => {
  const signerProfit = bundles.reduce((acc, bundle) => {
    acc[bundle.signer] = (acc[bundle.signer] || 0) + bundle.profit;
    return acc;
  }, {} as Record<string, number>);

  const searcherProfitArray = Object.entries(signerProfit).map(
    ([searcherAddress, profit]) => ({
      searcherAddress,
      profit,
    })
  );

  searcherProfitArray.sort((a, b) => b.profit - a.profit);

  return searcherProfitArray;
};

export const getTopBundles = (
  bundles: MevBundleWithProfit[]
): MevBundleWithProfit[] => {
  const sortedBundles = bundles.sort((a, b) => b.profit - a.profit);

  return sortedBundles;
};

export interface PoolProfit {
  pool: string;
  profit: number;
}

export const getTopSandwichPools = (
  bundles: MevBundleWithProfit[]
): PoolProfit[] => {
  const pools = bundles.map((bundle) => bundle.trades[0].poolAddress);
  const uniquePools = Array.from(new Set(pools));

  const poolProfit = uniquePools.map((pool) => {
    const poolBundles = bundles.filter(
      (bundle) => bundle.trades[0].poolAddress === pool
    );
    const poolProfit = poolBundles.reduce(
      (acc, bundle) => acc + bundle.profit,
      0
    );

    return {
      pool,
      profit: poolProfit,
    };
  });

  const poolsSortedByProfit = poolProfit.sort((a, b) => b.profit - a.profit);

  return poolsSortedByProfit;
};

export interface TokenPopularity {
  token: string;
  profit: number; // This is actually popularity count, not profit
}

export const getTopArbitrageTokens = (
  bundles: MevBundleWithProfit[]
): TokenPopularity[] => {
  const allTokensArr = [];

  for (const bundle of bundles) {
    let uniqueBundleTokens = new Set<string>();
    for (const trade of bundle.trades) {
      uniqueBundleTokens.add(trade.baseMint);
      uniqueBundleTokens.add(trade.quoteMint);
    }

    allTokensArr.push(...Array.from(uniqueBundleTokens));
  }

  const allTokensFiltered = allTokensArr.filter(
    (token) => token !== USDC_ADDRESS && token !== SOL_ADDRESS
  );

  const tokenPopularity = allTokensFiltered.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tokenPopularityArray = Object.entries(tokenPopularity).map(
    ([token, profit]) => ({
      token,
      profit,
    })
  );

  tokenPopularityArray.sort((a, b) => b.profit - a.profit);

  return tokenPopularityArray;
};

export interface ProgramPopularity {
  program: string;
  profit: number; // This is actually popularity count, not profit
}

export const getTopArbitragePrograms = (
  bundles: MevBundleWithProfit[]
): ProgramPopularity[] => {
  const programs = bundles
    .map((bundle) => bundle.trades[0].outerProgram)
    .filter(
      (program) =>
        !KNOWN_AMM_PROGRAMS_TRAITS.some((trait) => program.includes(trait))
    );

  const programPopularity = programs.reduce((acc, program) => {
    acc[program] = (acc[program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const programPopularityArray = Object.entries(programPopularity).map(
    ([program, profit]) => ({
      program,
      profit,
    })
  );

  programPopularityArray.sort((a, b) => b.profit - a.profit);

  return programPopularityArray;
};
