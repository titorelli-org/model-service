import { LogisticRegressionModel, DuplicateModel, ChainModel } from "../models";
import { TemporaryStorage } from "../temporary-storage";
import type { Logger } from "pino";
import type { LabeledExample, Labels } from "../types";
import { env } from "../env";

export class ModelService {
  private store: TemporaryStorage<ChainModel, []>;

  constructor(private modelFilename: string, private logger: Logger) {
    this.store = new TemporaryStorage(
      this.createModel,
      3600000 /* 3 hours */,
      this.logger,
    );
  }

  async predict(text: string) {
    const model = await this.store.getOrCreate();

    return model.predict({ text });
  }

  async train(text: string, label: Labels) {
    const model = await this.store.getOrCreate();

    await model.train({ text, label });
  }

  async trainBulk(examples: LabeledExample[]) {
    const model = await this.store.getOrCreate();

    await model.trainBulk(examples);
  }

  private createModel = () => {
    return new ChainModel([
      new DuplicateModel(env.TEXT_ORIGIN),
      new LogisticRegressionModel(this.modelFilename),
    ]);
  };
}
