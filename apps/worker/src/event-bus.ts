import { EventEmitter } from "node:events";
import type { RunEvent } from "@clone/contracts";

export class TypedEventBus {
  private readonly emitter = new EventEmitter();

  publish(event: RunEvent): void {
    this.emitter.emit(event.topic, event);
    this.emitter.emit("*", event);
  }

  subscribe(topic: string, listener: (event: RunEvent) => void): () => void {
    this.emitter.on(topic, listener);
    return () => this.emitter.off(topic, listener);
  }
}
