import {
  MevBundleWithTrades,
  PoolProfit,
  ProgramPopularity,
  SearcherProfit,
  TokenPopularity,
} from "../types";
import {
  KNOWN_AMM_PROGRAMS_TRAITS,
  SOL_ADDRESS,
  USDC_ADDRESS,
} from "../constants";
import { Trade } from "@prisma/client";
import database from "./database";

export const getTopSearchers = (
  bundles: MevBundleWithTrades[]
): SearcherProfit[] => {
  const mevType = bundles[0].mevType;

  let sortedBundles;

  // sort trades inside bundles

  if (mevType === "1") {
    sortedBundles = bundles.map((bundle) => ({
      ...bundle,
      trades: bundle.trades.sort(
        (a, b) => b.innerInstructionIndex - a.innerInstructionIndex
      ),
    }));
  } else {
    sortedBundles = bundles.map((bundle) => ({
      ...bundle,
      trades: bundle.trades.sort((a, b) => b.txIndex - a.txIndex),
    }));
  }

  const searchers = sortedBundles.reduce((acc, bundle) => {
    acc[bundle.trades[0].signer] = {
      ...acc[bundle.trades[0].signer],
      profit: (acc[bundle.trades[0].signer]?.profit || 0) + bundle.profit,
      numberOfTrades: (acc[bundle.trades[0].signer]?.numberOfTrades || 0) + 1,
    };

    return acc;
  }, {} as any);

  const searchersArr = Object.entries(searchers).map(([address, searcher]) => ({
    // @ts-ignore
    ...searcher,
    searcherAddress: address,
  }));

  const sortedSearchers = searchersArr.sort((a, b) => b.profit - a.profit);

  return sortedSearchers;
};

export const getTopBundles = (
  bundles: MevBundleWithTrades[]
): MevBundleWithTrades[] => {
  const sortedBundles = bundles.toSorted((a, b) => b.profit - a.profit);

  return sortedBundles;
};

export const getTopSandwichPools = (
  bundles: MevBundleWithTrades[]
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

export const getTopArbitrageTokens = (
  bundles: MevBundleWithTrades[]
): TokenPopularity[] => {
  const tokens: any = {};
  for (const bundle of bundles) {
    let uniqueBundleTokens = new Set<string>();
    for (const trade of bundle.trades) {
      tokens[trade.baseMint] = {
        ...tokens[trade.baseMint],
        profit: (tokens[trade.baseMint]?.profit || 0) + bundle.profit,
        numberOfTrades: (tokens[trade.baseMint]?.numberOfTrades || 0) + 1,
      };

      tokens[trade.quoteMint] = {
        ...tokens[trade.quoteMint],
        profit: (tokens[trade.quoteMint]?.profit || 0) + bundle.profit,
        numberOfTrades: (tokens[trade.quoteMint]?.numberOfTrades || 0) + 1,
      };
    }
  }

  delete tokens[SOL_ADDRESS];

  const tokensArr = Object.entries(tokens).map(([token, tokenData]) => ({
    // @ts-ignore
    ...tokenData,
    tokenAddress: token,
  }));

  // const tokensWithSymbol = await database.getTokens(
  //   tokensArr.map((token) => token.tokenAddress)
  // );

  // const tokensWithSymbolArr = tokensArr.map((token) => {
  //   const tokenWithSymbol = tokensWithSymbol.find(
  //     (t) => t.address === token.tokenAddress
  //   );
  //   return {
  //     ...token,
  //     symbol:
  //       `$${tokenWithSymbol?.symbol}` ||
  //       `${token.tokenAddress.slice(0, 4)}...${token.tokenAddress.slice(-4)}`,
  //   };
  // });

  const sortedTokens = tokensArr.toSorted((a, b) => b.profit - a.profit);

  return sortedTokens;
};

export const getUniqueArbitragePrograms = (
  bundles: MevBundleWithTrades[]
): number => {
  const programs = bundles
    .map((bundle) => bundle.trades[0].outerProgram)
    .filter(
      (program) =>
        !KNOWN_AMM_PROGRAMS_TRAITS.some((trait) => program.includes(trait))
    );

  const uniquePrograms = Array.from(new Set(programs));

  return uniquePrograms.length;
};

export const getTopArbitragePrograms = (
  bundles: MevBundleWithTrades[]
): ProgramPopularity[] => {
  const programs = bundles.reduce((acc, bundle) => {
    acc[bundle.trades[0].outerProgram] = {
      ...acc[bundle.trades[0].outerProgram],
      profit: (acc[bundle.trades[0].outerProgram]?.profit || 0) + bundle.profit,
      numberOfTrades:
        (acc[bundle.trades[0].outerProgram]?.numberOfTrades || 0) + 1,
    };
    return acc;
  }, {} as any);

  const programsArr = Object.entries(programs).map(
    ([program, programData]) => ({
      program,
      // @ts-ignore
      ...programData,
    })
  );

  const sortedPrograms = programsArr.sort((a, b) => b.profit - a.profit);

  return sortedPrograms;
};
