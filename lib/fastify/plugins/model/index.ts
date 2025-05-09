import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { Logger } from "pino";
import { ModelPlugin } from "./ModelPlugin";
import { ModelService } from "../../../model-service";

export interface CasPlugonOpts {
  model: ModelService;
  logger: Logger;
}

const modelPlugin: FastifyPluginAsync<CasPlugonOpts> = async (
  fastify,
  { model, logger },
) => {
  const plugin = new ModelPlugin(fastify, model, logger);

  await plugin.ready;
};

export default fastifyPlugin(modelPlugin);
