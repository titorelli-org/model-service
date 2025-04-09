import path from "node:path";
import fastify from "fastify";
import { logger } from "./lib";
import { ModelService } from "./lib";

const service = new ModelService(
  path.join(__dirname, "data/generic.dat"),
  logger,
);
const server = fastify({ loggerInstance: logger });

server.post<{
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
    return service.predict(text);
  },
);

server.post<{
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
    await service.train(text, label);
  },
);

server.post<{
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
    await service.trainBulk(examples);
  },
);

server.listen({
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "0.0.0.0",
});
