import { Monad, MonadConstructor, MonadInterface } from "./Monad.interface";
import { MonadsUtils } from "./Monads.utils";
import { Either } from "./Either";

export class Async<Error, T> implements Monad<T> {

    private asyncEither: Promise<Either<Error, T>>;

    constructor(private promise: Promise<T>) {
        this.asyncEither = promise.then(v => Either.of(v)).catch(err => Either.Throw<Error>(err)) as any;
    }

    try<A, Error, B>(fn: (a: A) => Promise<B>) {
        return (a: A): Async<Error, B> => {
            return new Async<Error, B>(fn(a));
        }
    }

    async tap(onError: (err: Error) => void, onResult: (v: T) => void) {
        const either = await this.asyncEither;
        either.tap(onError, onResult)
    }

    get return() {
        return v => new Async(Promise.resolve(v));
    }

    map<R>(f: (t: T) => R): Async<Error, R> {
        return new Async(this.promise.then(t => f(t)));
    }

    flatten<C>(this: Async<Error, Async<Error, C>>): Async<Error, C> {
        return new Async(this.promise.then(async => async.promise));
    }

    static of<Error, T>(t: T) {
        return new Async<Error, T>(Promise.resolve(t));
    }

}
