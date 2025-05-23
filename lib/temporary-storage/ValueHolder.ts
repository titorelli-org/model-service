import type { Logger } from "pino";
import type { HolderValueBase } from "./types";

export class ValueHolder<V extends HolderValueBase, Args extends any[]> {
  private timeout: NodeJS.Timeout | undefined;
  private value: V | undefined;

  constructor(
    private valueFactory: (...args: Args) => V | Promise<V>,
    private timeoutMs: number,
    private logger: Logger,
  ) {
    this.restartTimeout();
  }

  async get(...args: Args) {
    const value = this.value ?? (await this.create(...args));

    this.restartTimeout();

    return value;
  }

  private async create(...args: Args) {
    const value = await this.valueFactory(...args);

    this.value = value;

    if (Array.isArray(value)) {
      value.forEach((v) => v.onCreated?.());
    } else {
      value.onCreated?.();
    }

    return value;
  }

  private restartTimeout() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(this.onTimeout, this.timeoutMs);
  }

  private onTimeout = () => {
    if (Array.isArray(this.value)) {
      this.value.forEach((v) => v.onRemoved?.());
    } else {
      this.value?.onRemoved?.();
    }

    delete this.value;
  };
}
