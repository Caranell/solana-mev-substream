import { FastifyRequest, FastifyReply } from "fastify";
import bundlesService from "../services/mevBundles";
import { GetMEVBundlesParams } from "../types";
import { toJSONString } from "./utils";
import database from "../services/database";

const getBundles = async (
  request: FastifyRequest<{ Querystring: GetMEVBundlesParams }>,
  reply: FastifyReply
) => {
  console.log("getting bundles");
  const bundles = await bundlesService.getMEVBundles({
    period: request.query.period,
    mevType: request.query.mevType,
    limit: request.query.limit,
    offset: request.query.offset,
    orderBy: request.query.orderBy,
    orderDirection: request.query.orderDirection,
    noLimit: request.query.noLimit,
  });
  console.log("got bundles");

  const tradedTokens = bundles.map((bundle) =>
    bundle.trades.map((trade) => [trade.baseMint, trade.quoteMint])
  );
  const tokenSymbols = await database.getTokens(tradedTokens.flat(2));

    const enrichedBundles = bundles.map((bundle) => ({
      ...bundle,
      trades: bundle.trades.map((trade) => ({
        ...trade,
        baseTokenSymbol: tokenSymbols.find((token) => token.address === trade.baseMint)?.symbol,
        quoteTokenSymbol: tokenSymbols.find((token) => token.address === trade.quoteMint)?.symbol,
      })),
    }));

  const jsonString = toJSONString(enrichedBundles);

  return reply.status(200).send(jsonString);
};

const getStatistics = async (
  request: FastifyRequest<{ Querystring: GetMEVBundlesParams }>,
  reply: FastifyReply
) => {
  console.log("getting statistics");
  const bundles = await bundlesService.getMEVBundles({
    period: request.query.period,
    mevType: request.query.mevType,
    noLimit: true,
  });
  // await bundlesService.fillMissingTokens(bundles);
  console.log("got statistics");
  const stats = await bundlesService.getBundlesStatistics(bundles);
  console.log("formatted statistics");
  const jsonString = toJSONString(stats);

  return reply.status(200).send(jsonString);
};

export default {
  getBundles,
  getStatistics,
};
