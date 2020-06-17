import { EqFunction } from "./Types"
import { FunctionUtils } from "./Functions.utils";
import { Monoid } from "./fp/Monoid";

export class ArrayUtils {

    static intersection<T>(a: T[], b: T[]) {
        return [...new Set(a.filter(item => b.includes(item)).concat(b.filter(item => a.includes(item))))]
    }

    static hasIntersection<T>(a: T[], b: T[]) {
        return a.some(item => b.includes(item))
    }

    static filterNew<T>(old: T[], curr: T[], equalityFn: EqFunction<T>) {
        const filters = old.map(item => equalityFn(item));
        return curr.filter(item => filters.every(FunctionUtils.negativize(item)))
    }

    static compose<T>(array: T[], monoid: Monoid<T>, maxIndex: number = array.length - 1) {
        return array.reduce((result, item, index) => index <= maxIndex ? monoid.concat(result, item) : result, monoid.neutral);
    }

    static map<A,B>(mapFn: (a: A) => B) {
        return (arr: A[]) => arr.map(mapFn)
    }

    static flatMap<A,B>(map: (a: A) => B | B[]) {
        return (arr: A[]) => arr.flatMap(map)
    }

}