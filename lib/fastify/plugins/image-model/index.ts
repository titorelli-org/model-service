import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { Logger } from "pino";
import { ImageModelPlugin } from "./ImageModelPlugin";
import { ImageModelService } from "../../../image-model-service";

export interface TextModelPluginOpts {
  model: ImageModelService;
  logger: Logger;
}

const modelPlugin: FastifyPluginAsync<TextModelPluginOpts> = async (
  fastify,
  { model, logger },
) => {
  const plugin = new ImageModelPlugin(fastify, model, logger);

  await plugin.ready;
};

export default fastifyPlugin(modelPlugin);
