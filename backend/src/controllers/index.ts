import { FastifyRequest, FastifyReply } from "fastify";
import bundlesService from "../services/mevBundles";

const getBundles = async (request: FastifyRequest, reply: FastifyReply) => {
  const bundles = bundlesService.getMEVBundles({});

  return reply.status(200).send(bundles);
};

const getStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
  const stats = bundlesService.getBundlesStatistics({});

  return reply.status(200).send(stats);
};

export default {
  getBundles,
  getStatistics,
};
