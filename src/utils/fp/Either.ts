import { Monad, MonadConstructor } from "./Monad.interface";

export abstract class Either<Error, Value> implements Monad<Value> {

    abstract get return(): MonadConstructor<any>;

    abstract map<Result>(f: (val: Value) => Result): Either<Error, Result>;

    abstract flatten<C>(this: Either<Error, Either<Error, C>>): Either<Error, C>;

    abstract tap(onError: (err: Error) => void, onValue: (value: Value) => void);

    protected abstract unpack(): Value | undefined;

    static Throw<Error>(error: Error) {
        return new Left<Error>(error);
    }

    static returnOnError<A>(a: A) {
        return <E>(e: Either<E,A>) => e.unpack() || a;
    }

    static map<A,B>(mapFn: (a: A) => B) {
        return <E>(e: Either<E, A>) => e.map(mapFn)
    }

    static of<Error, Value>(val: Value): Either<Error, Value> {
        return new Right(val) as any;
    }

    static try<In, Out, Err>(fn: (input: In) => Out) {
        return (input: In): Either<Err, Out> => {
            try {
                return this.of<Err, Out>(fn(input));
            } catch (err) {
                return this.Throw<Err>(err);
            }
        }
    }
}

class Right<Value> extends Either<any, Value> {
    constructor(private value: Value) {
        super();
    }

    get return() {
        return v => new Right(v);
    }

    tap(_, onValue: (val: Value) => void) {
        onValue(this.value);
    }

    map<Result>(f: (val: Value) => Result): Either<Error, Result> {
        return Either.try<Value, Result, Error>(f)(this.value);
    }

    flatten<C>(this: Right<Either<Error, C>>): Either<Error, C> {
        return this.value;
    }

    unpack() {
        return this.value;
    }
}

class Left<Error> extends Either<Error, any> {
    constructor(private error: Error) {
        super();
    }

    get return() {
        return v => new Left(v);
    }

    map<Result>(): Either<Error, Result> {
        return this;
    }

    tap(onError: (err: Error) => void) {
        onError(this.error);
    }

    flatten<never>(this: Left<Error>): Either<Error, never> {
        return new Left(this.error);
    }

    unpack() {
        return undefined as never;
    }
}