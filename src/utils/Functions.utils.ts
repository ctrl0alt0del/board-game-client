import { SuperMaybe, Maybe } from "./fp/Maybe";

export type MapFunction<In, Out = In> = (input: In) => Out;

export const compose = <A, B, C>(f1: MapFunction<A, B>, f2: MapFunction<B, C>): MapFunction<A, C> => {
    return (a) => f2(f1(a));
}

export const compose3 = <A,B,C,D>(f1: MapFunction<A,B>, f2: MapFunction<B,C>, f3: MapFunction<C,D>) => compose(f1, compose(f2, f3)) 

export const asyncCompose = <A, B, C>(f1: MapFunction<A, Promise<B>>, f2: MapFunction<B, C>): MapFunction<A, Promise<C>> => {
    return async (a) => {
        const f1Res = await f1(a);
        return f2(f1Res);
    };
}

export type FunctionMonoid<A, B, C> = (f: MapFunction<A, B>, g: MapFunction<B, C>) => MapFunction<A, C>;

export const IdentityFunction = <X>(x: X) => x;

export type Semigroup<T> = MapFunction<T, MapFunction<T>>;

export class FunctionUtils {
    static negativize<T>(t: T) {
        return (fn: (t: T) => boolean) => !fn(t)
    }
}

export const add = (x: number) => (y: number) => x + y;

export const isTrue = <X>(x: SuperMaybe<X>) => Maybe.from(x).map(y => !!y).orDefault(false);

export const checkIf = <X>(check: (x: X) => SuperMaybe<X>) => compose(check, isTrue);

export const unzipArgsFor = <A,B,C>(fn: (a: A, b: B) => C) => (args: [A,B]) => fn(...args);

export const constant = <A>(a: A) => (b: A) => a;

export const whatever = <A>(a?: A) => (b: A) => b;

export const contramapFunction = <A,B,C>(map: (a: B) => A, f: (a: A) => C) => compose(map, f)