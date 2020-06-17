export interface Functor<A> {
    map<B>(mapFn: (a: A) => B): Functor<B>;
}
