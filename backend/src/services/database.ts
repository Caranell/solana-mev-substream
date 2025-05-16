import { PrismaClient } from "@prisma/client";
import { GetMEVBundlesParams, MevBundleWithTrades } from "../types";
import { getTokenMetadata } from "./helius";

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60;
const ONE_DAY_MS = ONE_DAY * 1000;

const getLatestBundle = async (): Promise<MevBundleWithTrades> => {
  const latestBundle = await prisma.mevBundle.findFirst({
    orderBy: {
      blockTime: "desc",
    },
    include: {
      trades: true,
    },
  });

  return latestBundle as MevBundleWithTrades;
};

const getTokenSymbol = async (tokenAddress: string) => {
  const token = await prisma.tokens.findFirst({
    where: {
      address: tokenAddress,
    },
  });

  if (token) {
    return token.symbol;
  }

  const metadata = await getTokenMetadata(tokenAddress);
  console.log("metadata", metadata);
  await prisma.tokens.create({
    data: {
      address: tokenAddress,
      symbol: metadata.symbol,
    },
  });

  return metadata.symbol;
};

const getTokens = async (tokens: string[]) => {
  const dbTokens = await prisma.tokens.findMany({
    where: {
      address: { in: tokens },
    },
  });

  return dbTokens;
};

const getMEVBundles = async ({
  period,
  mevType,
  orderBy = "profit",
  orderDirection = "desc",
  limit = 50,
  offset = 0,
  noLimit = false,
}: GetMEVBundlesParams): Promise<MevBundleWithTrades[]> => {
  const queryOptions: any = {
    orderBy: {
      [orderBy]: orderDirection,
    },
    where: {},
  };
  

  if (noLimit === false && limit) {
    queryOptions.take = limit;
  }

  if (offset) {
    queryOptions.skip = offset;
  }

  if (mevType) {
    queryOptions.where.mevType = mevType;
  }

  if (period) {
    const daysAgo = parseInt(period);
    const nowMs = Date.now();
    const timestampNDaysAgo = BigInt(
      Math.floor((nowMs - daysAgo * ONE_DAY_MS) / 1000)
    );

    queryOptions.where.blockTime = {
      gte: timestampNDaysAgo,
    };
  }

  const mevBundles = await prisma.mevBundle.findMany({
    ...queryOptions,
    include: {
      trades: true,
    },
  });

  return mevBundles as MevBundleWithTrades[];
};

export const createTokens = async (tokens: { address: string; symbol: string }[]) => {
  await prisma.tokens.createMany({
    data: tokens.map((token) => ({
      address: token.address,
      symbol: token.symbol || "Unknown",
    })),
  });
};

export default {
  getLatestBundle,
  getMEVBundles,
  getTokenSymbol,
  getTokens,
  createTokens,
};
