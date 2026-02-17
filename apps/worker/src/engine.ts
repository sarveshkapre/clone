import type { RunEvent } from "@clone/contracts";
import { TypedEventBus } from "./event-bus.js";

export class RunEngine {
  constructor(private readonly bus: TypedEventBus) {}

  emit(topic: string, type: string, payload: Record<string, unknown>): RunEvent {
    const event: RunEvent = {
      topic,
      type,
      ts: new Date().toISOString(),
      cursor: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      payload,
    };
    this.bus.publish(event);
    return event;
  }
}
