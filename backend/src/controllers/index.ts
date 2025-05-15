import { FastifyRequest, FastifyReply } from "fastify";
import bundlesService from "../services/mevBundles";
import { GetMEVBundlesParams } from "../types";

const getBundles = async (
  request: FastifyRequest<{ Querystring: GetMEVBundlesParams }>,
  reply: FastifyReply
) => {
  const bundles = bundlesService.getMEVBundles({
    period: request.query.period,
    mevType: request.query.mevType,
    limit: request.query.limit,
    offset: request.query.offset,
    orderBy: request.query.orderBy,
    orderDirection: request.query.orderDirection,
  });

  return reply.status(200).send(bundles);
};

const getStatistics = async (
  request: FastifyRequest<{ Querystring: GetMEVBundlesParams }>,
  reply: FastifyReply
) => {
  const bundles = await bundlesService.getMEVBundles({
    period: request.query.period,
    mevType: request.query.mevType,
    limit: request.query.limit,
    offset: request.query.offset,
    orderBy: request.query.orderBy,
    orderDirection: request.query.orderDirection,
    noLimit: true,
  });

  const stats = bundlesService.getBundlesStatistics(bundles);

  return reply.status(200).send(stats);
};

export default {
  getBundles,
  getStatistics,
};
