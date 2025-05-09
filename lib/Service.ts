import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import modelPlugin from "./fastify/plugins/model";
import type { ModelService } from "./model-service";

export interface ServiceConfig {
  host: string;
  port: number;
  model: ModelService;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly model: ModelService;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({ model, logger, host, port }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.model = model;
    this.logger = logger;

    this.ready = this.initialize();
  }

  public async listen() {
    await this.ready;

    await this.server.listen({ port: this.port, host: this.host });
  }

  private async initialize() {
    this.server = fastify({ loggerInstance: this.logger, trustProxy: true });

    await this.server.register(modelPlugin, {
      model: this.model,
      logger: this.logger,
    });
  }
}
