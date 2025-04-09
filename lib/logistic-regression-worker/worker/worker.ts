import { parentPort, workerData } from "node:worker_threads";
import { WorkerServer, type HandlerContext } from "../../rpc-worker";
import type { WorkerData } from "./types";

import { classifier } from "./classifier";

parentPort!.postMessage({ method: "ready" });

new WorkerServer<WorkerData>(parentPort!, workerData, {
  classify(normalizedText: string) {
    return classifier.classify(normalizedText);
  },

  trainBulk(
    this: HandlerContext<WorkerData>,
    docs: string[],
    labels: number[],
  ) {
    throw new Error("Not implemented yet");
  },
});
