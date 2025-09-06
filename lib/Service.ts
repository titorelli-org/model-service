import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import type { JwksStore } from "@titorelli-org/jwks-store";
import { oidcProvider } from "@titorelli-org/fastify-oidc-provider";
import {
  protectedRoutes,
  TokenValidator,
} from "@titorelli-org/fastify-protected-routes";
import modelPlugin from "./fastify/plugins/model";
import type { ModelService } from "./model-service";
import { env } from "./env";

export interface ServiceConfig {
  host: string;
  port: number;
  model: ModelService;
  jwksStore: JwksStore;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly model: ModelService;
  private readonly jwksStore: JwksStore;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({ model, logger, host, port, jwksStore }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.model = model;
    this.jwksStore = jwksStore;
    this.logger = logger;

    this.ready = this.initialize();
  }

  public async listen() {
    await this.ready;

    await this.server.listen({ port: this.port, host: this.host });
  }

  private async initialize() {
    this.server = fastify({ loggerInstance: this.logger, trustProxy: true });

    await this.server.register(oidcProvider, {
      origin: env.MODEL_ORIGIN,
      jwksStore: this.jwksStore,
      logger: this.logger,
    });

    const tokenValidator = new TokenValidator({
      jwksStore: this.jwksStore,
      testSubject: () => true,
      testAudience: () => true,
      logger: this.logger,
    });

    await this.server.register(protectedRoutes, {
      origin: env.MODEL_ORIGIN,
      authorizationServers: [`${env.MODEL_ORIGIN}/oidc`],
      allRoutesRequireAuthorization: false,
      logger: this.logger,
      async checkToken(token, url, scopes) {
        return tokenValidator.validate(token, url, scopes);
      },
    });

    await this.server.register(modelPlugin, {
      model: this.model,
      logger: this.logger,
    });
  }
}
