import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { Logger } from "pino";
import { TextModelPlugin } from "./TextModelPlugin";
import { TextModelService } from "../../../text-model-service";

export interface TextModelPluginOpts {
  model: TextModelService;
  logger: Logger;
}

const modelPlugin: FastifyPluginAsync<TextModelPluginOpts> = async (
  fastify,
  { model, logger },
) => {
  const plugin = new TextModelPlugin(fastify, model, logger);

  await plugin.ready;
};

export default fastifyPlugin(modelPlugin);
