import type { Logger } from "pino";
import fastify, { type FastifyInstance } from "fastify";
import type { JwksStore } from "@titorelli-org/jwks-store";
import { oidcProvider } from "@titorelli-org/fastify-oidc-provider";
import {
  protectedRoutes,
  TokenValidator,
} from "@titorelli-org/fastify-protected-routes";
import textModelPlugin from "./fastify/plugins/text-model";
import imageModelPlugin from "./fastify/plugins/image-model";
import type { TextModelService } from "./text-model-service";
import type { ImageModelService } from "./image-model-service";
import { env } from "./env";

export interface ServiceConfig {
  host: string;
  port: number;
  textModel: TextModelService;
  imageModel: ImageModelService;
  jwksStore: JwksStore;
  logger: Logger;
}

export class Service {
  private readonly host: string;
  private readonly port: number;
  private readonly textModel: TextModelService;
  private readonly imageModel: ImageModelService;
  private readonly jwksStore: JwksStore;
  private readonly logger: Logger;
  private server: FastifyInstance;
  private readonly ready: Promise<void>;

  constructor({
    textModel,
    imageModel,
    logger,
    host,
    port,
    jwksStore,
  }: ServiceConfig) {
    this.host = host;
    this.port = port;
    this.textModel = textModel;
    this.imageModel = imageModel;
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
      initialAccessToken: env.INITIAL_ACCESS_TOKEN,
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
      allRoutesRequireAuthorization: true,
      logger: this.logger,
      async checkToken(token, url, scopes) {
        return tokenValidator.validate(token, url, scopes);
      },
    });

    await this.server.register(textModelPlugin, {
      model: this.textModel,
      logger: this.logger,
    });

    await this.server.register(imageModelPlugin, {
      model: this.imageModel,
      logger: this.logger,
    });
  }
}
