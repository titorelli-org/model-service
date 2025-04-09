import type { Logger } from "pino";
import { ValueHolder } from "./ValueHolder";
import type { HolderValueBase } from "./types";

export class TemporaryStorage<V extends HolderValueBase, Args extends any[]> {
  private internalMap = new Map<string, ValueHolder<V, Args>>();

  constructor(
    private valueFactory: (...args: Args) => V | Promise<V>,
    private storeTimeoutMs: number,
    private logger: Logger,
  ) {}

  async getOrCreate(...args: Args) {
    return (this.get(...args) ?? this.create(...args)).get(...args);
  }

  private create(...args: Args) {
    const holder = new ValueHolder<V, Args>(
      this.valueFactory,
      this.storeTimeoutMs,
      this.logger,
    );

    this.set(holder, ...args);

    return holder;
  }

  private get(...args: Args) {
    return this.internalMap.get(this.createKey(...args));
  }

  private set(holder: ValueHolder<V, Args>, ...args: Args) {
    return this.internalMap.set(this.createKey(...args), holder);
  }

  private createKey(...args: Args) {
    return args.join("-");
  }
}
