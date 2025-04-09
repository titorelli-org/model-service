import { existsSync } from "node:fs";
import { workerData } from "node:worker_threads";
import { LogisticRegression } from "@titorelli/logistic-regression";
import type { WorkerData } from "./types";

const { modelFilename } = workerData as WorkerData;

export const classifier = new LogisticRegression({
  learningRate: 0.01,
  iterations: 1000,
});

if (existsSync(modelFilename)) {
  classifier.loadModel(modelFilename);
} else {
  throw new Error(
    `Cannot load model bc file "${modelFilename}" doesen\'t exits`,
  );
}
