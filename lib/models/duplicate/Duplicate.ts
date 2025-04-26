import {
  UnlabeledExample,
  Prediction,
  Labels,
  LabeledExample,
} from "../../types";
import type { IModel } from "../IModel";
import { getUUIDStringFromText } from "../../misc";

export class DuplicateModel implements IModel {
  public type = "duplicate" as const;

  constructor(private textStorageOrigin: string) {}

  async predict({ text }: UnlabeledExample): Promise<Prediction | null> {
    try {
      const uuid = getUUIDStringFromText(text);
      const url = new URL(`/metadata/${uuid}`, this.textStorageOrigin);

      const resp = await fetch(url);

      if (!resp.ok) {
        return null;
      }

      try {
        const { label, confidence } = (await resp.json()) as Awaited<{
          label: Labels;
          confidence: number;
        }>;

        return {
          label,
          confidence,
          reason: "duplicate",
        };
      } catch (_e) {
        return null;
      }
    } catch (_e) {
      console.error(_e);

      return null;
    }
  }

  async train(example: LabeledExample): Promise<void> {
    // Not implemeted yet
  }

  async trainBulk(examples: LabeledExample[]): Promise<void> {
    // Not implemeted yet
  }

  onCreated(): void {}

  onRemoved(): void {}
}
