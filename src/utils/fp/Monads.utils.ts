import { Monad } from "./Monad.interface";

export class MonadsUtils {
    static readonly flatMap = <A,B>(m: Monad<A>, f: (a: A) => Monad<B>) => m.map(f).flatten();
}