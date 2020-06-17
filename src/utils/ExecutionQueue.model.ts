export class ExecutionQueue<T> {

    private queue: T[] = [];

    constructor(private execFn: (t: T) => Promise<void>) {

    }

    enqueue(t: T) {
        this.queue.push(t);
        if(this.queue.length === 1) {
            this.execute();
        }
    }

    private async execute() {
        const [t] = this.queue;
        if(t) {
            await this.execFn(t);
            this.queue = this.queue.filter(t2 => t2 !== t);
            this.execute();
        }
    }
}