import { Monad } from "./Monad.interface";
import { compose } from "../Functions.utils";

export enum NoneType {
    Undefined,
    Nullable,
    Falsy
}

export type SuperMaybe<T> = Maybe<T> | T;

const UndefinedCheck = (value: any) => typeof value === 'undefined';
const NullableCheck = (value: any) => NoneResolvePredicates[NoneType.Undefined](value) || value === null;
const FalsyCheck = (value: any) => NoneResolvePredicates[NoneType.Nullable](value) || value === false;
const NoneResolvePredicates: { [key in NoneType]: (value: any) => boolean } = {
    [NoneType.Undefined]: UndefinedCheck,
    [NoneType.Nullable]: NullableCheck,
    [NoneType.Falsy]: FalsyCheck
}

export type Undefinable<T> = T | undefined;

export type Nullable<T> = T | null;

export type Probably<T> = Undefinable<T> | Nullable<T> | false;

export abstract class Maybe<In> implements Monad<In> {

    return<B>(b: B) {
        return Maybe.from(b);
    }

    abstract orDefault(def: In): In;

    abstract asArray<In2>(this: Maybe<In2[]>): In2[];

    abstract map<Out>(f: (a: In) => Out): Maybe<Out>;

    abstract flatten<C>(this: Maybe<Maybe<C>>): Maybe<C>;

    abstract toPromise<A>(this: Maybe<Promise<A>>): Promise<Maybe<A>>;

    static all<C>(maybesList: Maybe<C>[]): Maybe<C[]> {
        if (maybesList.some(maybe => maybe instanceof None)) {
            return this.getNothing<C[]>();
        } else {
            return Maybe.from(maybesList.map(maybe => (maybe as Just<C>).getValue()))
        }
    }

    call<Out>(method: (...args: any) => Out, ...args: any[]) {
        return this.map<Out>(val => method.apply(val, args));
    }

    static orDefault<T>(t: T) {
        return (maybe: Maybe<T>) => maybe.orDefault(t);
    }

    static maybeMapArray<T,R>(mapFn: (t: T) => R) {
        return Maybe.map((array: T[]) => array.map(mapFn))
    }

    static flatten<A>(maybe: Maybe<Maybe<A>>) {
        return maybe.flatten();
    }

    static of<In>(value: Probably<In>, noneType: NoneType = NoneType.Nullable) {
        return NoneResolvePredicates[noneType](value) ? new None() : new Just(value) as any;
    }

    static from<In>(value: Probably<In> | Maybe<In>, noneType: NoneType = NoneType.Nullable): Maybe<In> {
        if (value instanceof Maybe) {
            return value;
        }
        return NoneResolvePredicates[noneType](value) ? new None() : new Just(value) as any;
    }

    static getNothing<T>() {
        return new None<T>();
    }

    static flat<In>(maybe: (Maybe<In>)[]): In[] {
        return maybe.reduce((output, currentMaybe) => currentMaybe instanceof Just ? output.concat(currentMaybe.getValue()) : output, [])
    }


    static findInArray<T>(array: T[], predicate: (t: T) => boolean): Maybe<T> {
        return Maybe.of(array.find(predicate))
    }

    static map<In, Out>(mapper: (arg: In) => Out) {
        return (t: Maybe<In>) => {
            return t.map(mapper);
        }
    }
}

class Just<In> extends Maybe<In> {

    constructor(private value: In) {
        super();
    }

    asArray<In2>(this: Just<In2[]>) {
        return this.value;
    }

    flatten<C>(this: Just<Maybe<C>>): Maybe<C> {
        return this.value;
    }

    map<Out>(f: (a: In) => Out): Maybe<Out> {
        return Maybe.of(f(this.value));
    }

    orDefault() {
        return this.value;
    }

    getValue() {
        return this.value;
    }

    toPromise<A>(this: Just<Promise<A>>) {
        return this.value.then(result => new Just(result));
    }
}

class None<In> extends Maybe<In> {

    map<Out>(f: (arg: In) => Out): Maybe<Out> {
        return new None();
    }

    flatten<C>(this: None<Maybe<C>>): Maybe<C> {
        return new None();
    }

    asArray() {
        return [];
    }

    orDefault(def: In) {
        return def;
    }


    toPromise<A>(this: None<Promise<A>>) {
        return Promise.resolve(new None<A>());
    }
}

export const maybeMap = <T, K>(value: Nullable<T>, mapFn: (t: T) => K) => {
    return Maybe.from(value, NoneType.Nullable).map(mapFn)
}
