import type { UnlabeledExample, Prediction, LabeledExample } from "../types";
import type { IModel } from "./IModel";
import { LogisticRegressionWorker } from "../logistic-regression-worker";
import { PorterStemmerRu } from "natural";

export class LogisticRegressionModel implements IModel {
  private worker: LogisticRegressionWorker;

  public type = "logistic-regression" as const;

  constructor(modelFilename: string) {
    this.worker = new LogisticRegressionWorker({
      modelFilename,
    });
  }

  async predict(example: UnlabeledExample): Promise<Prediction | null> {
    const score = await this.worker.classify(
      PorterStemmerRu.tokenizeAndStem(example.text).join(" "),
    );
    const label = score <= 0.5 ? "ham" : "spam";

    return {
      label,
      confidence: score,
      reason: "classifier",
    };
  }

  async train(example: LabeledExample): Promise<void> {
    await this.trainBulk([example]);
  }

  async trainBulk(examples: LabeledExample[]): Promise<void> {
    await this.worker.trainBulk(examples);
  }

  onRemoved(): void {
    void this.worker.stop();
  }
}
