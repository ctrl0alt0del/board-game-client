export class Objects {
    static getProperty<A,Key extends keyof A>(key: Key) {
        return (a: A) => a ? a[key] : undefined;
    }
}