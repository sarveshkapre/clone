export class BoundedScheduler {
  private readonly queue: Array<() => Promise<void>> = [];
  private active = 0;

  constructor(private readonly concurrency: number) {}

  enqueue(task: () => Promise<void>): void {
    this.queue.push(task);
    this.drain();
  }

  private drain(): void {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) return;
      this.active += 1;
      void next()
        .catch(() => {
          // Keep scheduler resilient; caller handles logging.
        })
        .finally(() => {
          this.active -= 1;
          this.drain();
        });
    }
  }
}
