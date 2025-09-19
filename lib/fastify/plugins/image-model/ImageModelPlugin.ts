import { Logger } from "pino";
import type { ImageModelService } from "../../../image-model-service";
import { FastifyInstance } from "fastify";

export class ImageModelPlugin {
  public readonly ready: Promise<void>;

  constructor(
    private readonly service: FastifyInstance,
    private readonly imageModel: ImageModelService,
    private readonly logger: Logger,
  ) {
    this.ready = this.initialize();
  }

  private async initialize() {
    this.service.post<{
      Body: {
        images: string[];
      };
    }>(
      "/image/predict",
      {
        schema: {
          body: {
            type: "object",
            required: ["images"],
            properties: {
              images: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          response: {
            200: {
              type: "array",
              items: {
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
      },
      async ({ body: { images } }) => {
        return this.imageModel.predict(images);
      },
    );
  }
}
