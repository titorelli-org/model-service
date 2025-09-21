import type { Client } from "@gradio/client";
import type { Logger } from "pino";

export type Result = {
  type: string;
  time: Date;
  data: string[];
  endpoint: string;
  fn_index: number;
};

export class ImageToPrompt {
  private readonly clientsCache = new Map<string, Client>();

  constructor(private readonly logger: Logger) {}

  public async imagesToPrompts(
    imageUrls: string[],
  ): Promise<(string | null)[]> {
    try {
      const imagesBlobs = await Promise.all(
        imageUrls.map((imageUrl) => this.simpleFetchImage(imageUrl)),
      );

      const client = await this.getClient("ovi054/image-to-prompt");
      // const client = await this.getClient("http://localhost:7860");

      const results = await Promise.all(
        imagesBlobs.map((image) =>
          image ? client.predict("/predict", { image }) : null,
        ),
      );

      return results.flatMap(({ data }) => data as string[]);
    } catch (e) {
      this.logger.error(e);

      return null;
    }
  }

  private async getClient(source: string) {
    const { Client } = await import("@gradio/client");

    let client = this.clientsCache.get(source);

    if (!client) {
      client = await Client.connect(source);

      this.clientsCache.set(source, client);
    }

    return client;
  }

  private async simpleFetchImage(fullSrc: string) {
    try {
      const resp = await fetch(fullSrc);

      return resp.blob();
    } catch (e) {
      this.logger.error(e);

      return null;
    }
  }
}
