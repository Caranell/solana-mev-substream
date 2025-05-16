import { PrismaClient } from "@prisma/client";
import { GetMEVBundlesParams, MevBundleWithTrades } from "../types";
import { getTokenName } from "./helius";

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

  const symbol = await getTokenName(tokenAddress);
  await prisma.tokens.create({
    data: {
      address: tokenAddress,
      symbol,
    },
  });

  return symbol;
};

const getMEVBundles = async ({
  period,
  mevType,
  orderBy = "blockTime",
  orderDirection = "desc",
  limit = 10,
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

export default {
  getLatestBundle,
  getMEVBundles,
  getTokenSymbol,
};
