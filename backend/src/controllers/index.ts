import { FastifyRequest, FastifyReply } from "fastify";
import bundlesService from "../services/mevBundles";
import { GetMEVBundlesParams } from "../types";
import { toJSONString } from "./utils";

const getBundles = async (
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
    noLimit: request.query.noLimit,
  });

  const jsonString = toJSONString(bundles);

  return reply.status(200).send(jsonString);
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

  const jsonString = toJSONString(stats);

  return reply.status(200).send(jsonString);
};

export default {
  getBundles,
  getStatistics,
};
