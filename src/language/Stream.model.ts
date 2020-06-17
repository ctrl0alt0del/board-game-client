export abstract class Stream<T, K = any> {
    abstract read(): T;
    abstract peek(): T;
    abstract clone(): Stream<T, K>;
    abstract isEof(): boolean;
    abstract getCursor(): K;
    abstract setCursor(k: K): void;

    readWhile(predicate: (t: T) => boolean) {
        const output: T[] = [];
        while (!this.isEof()) {
            const char = this.peek();
            if (predicate(char)) {
                output.push(char);
                this.read();
            }
            else {
                break;
            }
        }
        return output;
    }
}