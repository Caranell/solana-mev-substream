import { PrismaClient, MevBundle, Trade } from '@prisma/client'
import { MevBundleWithTrades } from '../types'

type MEVBundlesFilter = {
  period?: string
  mev_type?: string
  limit?: number
  offset?: number
}

const prisma = new PrismaClient()

 const getLatestBundle = async () => {
  const latestBundle = await prisma.mevBundle.findFirst({
    orderBy: {
      blockTime: 'desc',
    },
  })

  return latestBundle
}

 const getMEVBundles = async ({
  period,
  mevType,
  limit = 10,
  offset = 0,
}: MEVBundlesFilter): Promise<MevBundleWithTrades[]> => {
  const filters: MEVBundlesFilter = {}

  if (period) {
  }

  if (mevType) {
    filters.mev_type = mevType
  }

  if (limit) {
    filters.limit = limit
  }

  if (offset) {
    filters.offset = offset
  }

  // join mevBundles with trades on bundleId
  const mevBundles = await prisma.mevBundle.findMany({
    // where: filters,
    include: {
      trades: true,
    },
  })

  return mevBundles
}

export default {
  getLatestBundle,
  getMEVBundles,
}
