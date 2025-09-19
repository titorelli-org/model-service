import { LogisticRegressionModel } from "../models";
import type { Logger } from "pino";
import { TemporaryStorage } from "../temporary-storage";
import { ImageToPrompt } from "./ImageToPrompt";
import { getStemmer } from "../models/logistic-regression/getStemmer";

export class ImageModelService {
  private readonly store: TemporaryStorage<LogisticRegressionModel, []>;
  private readonly imageToPrompt: ImageToPrompt;

  constructor(private modelFilename: string, private logger: Logger) {
    this.store = new TemporaryStorage(
      this.createModel,
      3600000 /* 3 hours */,
      this.logger,
    );

    this.imageToPrompt = new ImageToPrompt(this.logger);
  }

  async predict(imageUrls: string[]) {
    const model = await this.store.getOrCreate();
    const textPrompts = await this.imageToPrompt.imagesToPrompts(imageUrls);
    const stemmer = getStemmer();

    const predictions = await Promise.all(
      textPrompts.map((text) =>
        text
          ? model.predict({ text: stemmer.tokenizeAndStem(text).join(" ") })
          : null,
      ),
    );

    console.log("predictions", predictions);

    return predictions;
  }

  private createModel = () => {
    return new LogisticRegressionModel(this.modelFilename);
  };
}
