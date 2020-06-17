import { FunctionMonoid } from "../Functions.utils";

export type MonadConstructor<B> = (a: B) => Monad<B>;

export interface MonadInterface {
    return: <A>(a: A) => Monad<A>;
    bind: <A,B>(m: Monad<A>, f: (a: A) => Monad<B>) => Monad<B>;
}

export interface Monad<A>{
    return<B>(b: B): Monad<B>;
    map<B>(f: (a: A) => B): Monad<B>;
    flatten<C>(this: Monad<Monad<C>>): Monad<C>;

}
