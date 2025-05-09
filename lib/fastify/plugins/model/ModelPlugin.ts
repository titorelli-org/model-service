import { Logger } from "pino";
import type { ModelService } from "../../../model-service";
import { FastifyInstance } from "fastify";

export class ModelPlugin {
  public readonly ready: Promise<void>;

  constructor(
    private readonly service: FastifyInstance,
    private readonly model: ModelService,
    private readonly logger: Logger,
  ) {
    this.ready = this.initialize();
  }

  private async initialize() {
    this.service.post<{
      Body: {
        text: string;
      };
    }>(
      "/predict",
      {
        schema: {
          body: {
            type: "object",
            required: ["text"],
            properties: {
              text: { type: "string" },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                reason: { enum: ["classifier"] },
                label: { enum: ["spam", "ham"] },
                confidence: { type: "number" },
              },
            },
          },
        },
      },
      async ({ body: { text } }) => {
        return this.model.predict(text);
      },
    );

    this.service.post<{
      Body: {
        label: "spam" | "ham";
        text: string;
      };
    }>(
      "/train",
      {
        schema: {
          body: {
            type: "object",
            required: ["text"],
            properties: {
              label: {
                enum: ["spam", "ham"],
              },
              text: {
                type: "string",
              },
            },
          },
        },
      },
      async ({ body: { text, label } }) => {
        await this.model.train(text, label);
      },
    );

    this.service.post<{
      Body: {
        label: "spam" | "ham";
        text: string;
      }[];
    }>(
      "/trainBulk",
      {
        schema: {
          body: {
            type: "array",
            items: {
              type: "object",
              required: ["text", "label"],
              properties: {
                label: {
                  enum: ["spam", "ham"],
                },
                text: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      async ({ body: examples }) => {
        await this.model.trainBulk(examples);
      },
    );
  }
}
