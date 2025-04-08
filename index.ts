import fastify from "fastify";
import { logger } from "./lib";

const server = fastify({ loggerInstance: logger });

server.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "0.0.0.0",
});
