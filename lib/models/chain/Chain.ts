import type { LabeledExample, Prediction, UnlabeledExample } from "../../types";
import type { IModel } from "../IModel";

export class ChainModel implements IModel {
  public type = "chain" as const;

  constructor(private models: IModel[]) {}

  async predict(example: UnlabeledExample): Promise<Prediction | null> {
    for (const model of this.models) {
      const result = await model.predict(example);

      if (result != null) return result;
    }

    return null;
  }

  async train(example: LabeledExample): Promise<void> {
    for (const model of this.models) {
      await model.train(example);
    }
  }

  async trainBulk(examples: LabeledExample[]): Promise<void> {
    for (const model of this.models) {
      await model.trainBulk(examples);
    }
  }

  onCreated(): void {
    for (const model of this.models) {
      model.onCreated?.();
    }
  }

  onRemoved(): void {
    for (const model of this.models) {
      model.onCreated?.();
    }
  }
}
