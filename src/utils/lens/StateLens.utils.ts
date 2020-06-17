import { Maybe, maybeMap, SuperMaybe } from "../fp/Maybe"
import { Injector, Type } from "injection-js";
import { PureReader } from "../fp/Reader";
import { add, compose, compose3 } from "../Functions.utils";

const getByKey = key => object => object[key];

const assignKey = <V>(key: any, value: V) => model => Object.assign({}, model, { [key]: value });

const findInArray = predicate => array => array.find(predicate);

const updateInArray = (predicate, model) => array => array.map(item => predicate(item) ? model : item);

const getLastElement = array => array[array.length - 1];

const concat = model => array => array.concat(model);

const filterInArray = predicate => array => array.filter(predicate);

const mapArray = <T, C>(mapFn: (value: T, index: number, array: T[]) => C) => (array: T[]) => array.map(mapFn)

export interface ReadOnlyLens<A, B> {
    get(model: SuperMaybe<A>): Maybe<B>;
}

export interface Lens<A, B> extends ReadOnlyLens<A, B> {
    set(model: A | Maybe<A>, value: B | Maybe<B>): Maybe<A>;
}

export interface ReaderLens<A, B> {
    get(): PureReader<SuperMaybe<A>, Maybe<B>>;
    set(value: B): PureReader<SuperMaybe<A>, Maybe<A>>
}

export interface ArrayLens<A, B> extends Lens<A, B[]> {
    add(item: SuperMaybe<B>): (model: SuperMaybe<A>) => SuperMaybe<A>;
    filter(predicate: (b: B) => boolean): ArrayLens<A, B>
    map<C>(mapFn: (b: B) => C, unMapFn: (c: C) => B): ArrayLens<A, C>
}

export interface ReadOnlyArrayLens<A, B> extends ReadOnlyLens<A, B[]> {
    filter(predicate: (b: B) => boolean): ReadOnlyArrayLens<A, B>
    map<C>(mapFn: (b: B) => C): ReadOnlyArrayLens<A, C>
}

export class LensUtils {

    static get<A, B>(lens: Lens<A, B>) {
        return lens.get;
    }

    private static identity<A>(): Lens<A, A> {
        return {
            get(model) {
                return Maybe.from(model);
            },
            set(model, value) {
                return Maybe.from(value);
            }
        }
    }

    static compose<A, B, C>(ab: Lens<A, B>, bc: Lens<B, C>): Lens<A, C> {
        return {
            get(model) {
                return bc.get(ab.get(model))
            },
            set(model, value) {
                return ab.set(model, bc.set(ab.get(model), value))
            }
        }
    }

    static key<Model, Key extends keyof Model = keyof Model>(key: Key): Lens<Model, Model[Key]> {
        return {
            get(model) {
                return Maybe.from(model).map(getByKey(key))
            },
            set(model, value) {
                const maybeValue = Maybe.from(value).orDefault(null);
                return Maybe.from(model).map(assignKey(key, maybeValue))
            }
        }
    }

    static find<Model>(predicate: (m: Model) => boolean): Lens<Model[], Model> {
        return {
            get(array) {
                return Maybe.from(array).map(findInArray(predicate));
            },
            set(array, model) {
                const maybeModel = Maybe.from(model).orDefault(null);
                return Maybe.from(array).map(updateInArray(predicate, maybeModel))
            }
        }
    }

    static filter<Model>(predicate: (m: Model) => boolean): Lens<Model[], Model[]> {
        return {
            get(array) {
                return Maybe.from(array).map(filterInArray(predicate));
            },
            set(array, models) {
                const maybeModel = Maybe.from(models).orDefault([]);
                return Maybe.from(array).map(concat(maybeModel));
            }
        }
    }

    static push<Model>(): Lens<Model[], Model> {
        return {
            get(array) {
                return Maybe.from(array).map(getLastElement);
            },
            set(array, model) {
                const maybeModel = Maybe.from(model).orDefault(null);
                return Maybe.from(array).map(concat(maybeModel));
            }
        }
    }

    static injector<T>(Class: Type<T>): Lens<Injector, T> {
        return {
            get(injector) {
                return Maybe.from(injector).map(injector => injector.get(Class));
            },
            set(injector, value) {
                return Maybe.from(injector);
            }
        }
    }

    static dictionary<K, V>(key: K): Lens<Map<K, V>, V> {
        return {
            get(dict) {
                return Maybe.from(dict).map(dict => dict.get(key));
            },
            set(dict, value) {
                return Maybe.from(dict).map(dict => {
                    Maybe.from(value).map(value => dict.set(key, value))
                    return dict;
                })
            }
        }
    }

    static toArrayLens<Model, Item>(lens: Lens<Model, Item[]>): ArrayLens<Model, Item> {
        return {
            add(item) {
                const maybeItem = Maybe.from<Item | Item[]>(item).orDefault([])
                return model => {
                    return lens.set(model, lens.get(model).map(m => m.concat(maybeItem)))
                }
            },
            get(model) {
                return lens.get(model);
            },
            filter(predicate) {
                return LensUtils.toArrayLens({
                    get(model) {
                        return lens.get(model).map(filterInArray(predicate))
                    },
                    set(model, value) {
                        const maybeValue = Maybe.from(value);
                        return lens.set(model, maybeValue.map(filterInArray(predicate)))
                    }
                })
            },
            set(model, value) {
                return lens.set(model, value);
            },
            map(mapFn, unMapFn) {
                return LensUtils.toArrayLens({
                    get(model) {
                        return lens.get(model).map(mapArray(mapFn))
                    },
                    set(model, value) {
                        const maybeValue = Maybe.from(value).map(mapArray(unMapFn));
                        return lens.set(model, maybeValue)
                    }
                })
            }
        }
    }

    static toReadOnlyArrayLens<Model, Item>(lens: ReadOnlyLens<Model, Item[]>): ReadOnlyArrayLens<Model, Item> {
        return {
            get(model) {
                return lens.get(model);
            },
            filter(predicate) {
                return LensUtils.toReadOnlyArrayLens({
                    get(model) {
                        return lens.get(model).map(filterInArray(predicate))
                    }
                })
            },
            map(mapFn) {
                return LensUtils.toReadOnlyArrayLens({
                    get(model) {
                        return lens.get(model).map(mapArray(mapFn))
                    }
                })
            }
        }
    }

    static withReader<A, B>(lens: Lens<A, B>): ReaderLens<A, B> {
        return {
            get() {
                return a => lens.get(a)
            },
            set(value) {
                return a => lens.set(a, value)
            }
        }
    }

    static keyPath<A, B>(path: string[]): Lens<A, B> {
        return path.reduce((prev, key) => LensUtils.compose(prev, LensUtils.key<any, any>(key)), this.identity()) as any;
    }

    static add<Model>(value: number) {
        return (lens: Lens<Model, number>) => (model: Model) => lens.set(model, lens.get(model).map(add(value)));
    }

    static aggregate<A, B, C>(sourceLens: ReadOnlyLens<A, B>, childLensFactory: (b: B) => Lens<A, C>): ReadOnlyLens<A, C> {
        return {
            get(model) {
                return compose3(sourceLens.get, Maybe.map(childLensFactory), Maybe.map(lens => lens.get(model)))(model).flatten()
            }
        }
    }
}