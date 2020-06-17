export interface Monoid<T> {
    concat: (a: T, b: T) => T;
    neutral: T;
}

export const morphMonoid = <T,R>(morphism: (t: T) => R, reverseMorph: (r: R) => T) => (monoid: Monoid<T>): Monoid<R> => {
    return {
        neutral: morphism(monoid.neutral),
        concat: (a, b) => morphism(monoid.concat(reverseMorph(a),reverseMorph(b)))
    }
}

export const SumNumberMonoid: Monoid<number> = {
    concat: (a, b) => a + b,
    neutral: 0
}