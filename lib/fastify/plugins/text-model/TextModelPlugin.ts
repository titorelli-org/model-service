import { Logger } from "pino";
import type { TextModelService } from "../../../text-model-service";
import { FastifyInstance } from "fastify";

export class TextModelPlugin {
  public readonly ready: Promise<void>;

  constructor(
    private readonly service: FastifyInstance,
    private readonly textModel: TextModelService,
    private readonly logger: Logger,
  ) {
    this.ready = this.initialize();
  }

  private installPredictRoute(prefix = "") {
    this.service.post<{
      Body: {
        text: string;
      };
    }>(
      `${prefix}/predict`,
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
        return this.textModel.predict(text);
      },
    );
  }

  private installTrainRoute(prefix = "") {
    this.service.post<{
      Body: {
        label: "spam" | "ham";
        text: string;
      };
    }>(
      `${prefix}/train`,
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
        await this.textModel.train(text, label);
      },
    );
  }

  private installBulkTrainRoute(prefix = "") {
    this.service.post<{
      Body: {
        label: "spam" | "ham";
        text: string;
      }[];
    }>(
      `${prefix}/trainBulk`,
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
        await this.textModel.trainBulk(examples);
      },
    );
  }

  private async initialize() {
    // Modern
    this.installPredictRoute("/text");
    this.installTrainRoute("/text");
    this.installBulkTrainRoute("/text");

    // Legacy
    this.installPredictRoute();
    this.installTrainRoute();
    this.installBulkTrainRoute();
  }
}
