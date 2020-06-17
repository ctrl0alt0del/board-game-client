import { compose, asyncCompose } from "../Functions.utils";
import { Functor } from "./Functor.interface";
import { Monad, MonadConstructor } from "./Monad.interface";
import { Maybe } from "./Maybe";

export type PureReader<Source, ReturnType> = (source: Source) => ReturnType;

export class Reader<T, K> implements Monad<K> {
    constructor(protected fn: (t: T) => K) {

    }

    get return() {
        return k => new Reader(t => k);
    }
    resolve(t: T) {
        return this.fn(t);
    }
    map<Result>(mapFn: (k: K) => Result) {
        return new Reader(compose(this.fn, mapFn));
    }
    flatten<C>(this: Reader<T, Reader<T, C>>): Reader<T,C> {
        return new Reader<T,C>(t => {
            return this.fn(t).fn(t);
        })
    }

    toMaybeReader<A,B>(this: Reader<A, Maybe<B>>) {
        return new MaybeReader(this.fn);
    }
}

export class AsyncReader<T, K> extends Reader<T, Promise<K>> {
    asyncMap<R>(mapFn: (k: K) => R): AsyncReader<T, R> {
        return new AsyncReader(asyncCompose(this.fn, mapFn))
    }
}

export class MaybeReader<T, K> extends Reader<T, Maybe<K>> {
    maybeMap<R>(mapFn: (k: K) => R) {
        return new MaybeReader((t: T) => this.fn(t).map(mapFn))
    }

    static fromMaybe<A,B>(maybe: Maybe<Reader<A,B>>) {
        return new MaybeReader((a: A) => maybe.map(internalReader => internalReader.resolve(a)))
    }
}