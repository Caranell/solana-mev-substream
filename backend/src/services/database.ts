import { PrismaClient, MevType } from "@prisma/client";
import { GetMEVBundlesParams, MevBundleWithTrades } from "../types";

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60;
const ONE_DAY_MS = ONE_DAY * 1000;

const getLatestBundle = async () => {
  const latestBundle = await prisma.mevBundle.findFirst({
    orderBy: {
      blockTime: "desc",
    },
  });

  return latestBundle;
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
  };

  if (noLimit === false && limit) {
    queryOptions.take = limit;
  }

  if (offset) {
    queryOptions.skip = offset;
  }

  if (mevType) {
    queryOptions.where.mevType = mevType as MevType;
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
};
