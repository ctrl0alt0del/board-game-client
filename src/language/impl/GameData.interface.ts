import { Maybe } from "../../utils/fp/Maybe";
import { GameValue } from "../../game-logic/game-state-machine/GameTerms";

export class GameData {
    private dataMap = new Map<string, any>();

    add<T>(pair: KeyValuePair<T>) {
        this.dataMap.set(pair.key, pair.value);
        return this;
    }

    merge(another: GameData) {
        for(const [key, value] of another.dataMap) {
            this.dataMap.set(key, value);
        }
        return this;
    }

    get<T>(key: string) {
        return this.dataMap.get(key) as T;
    }

    maybeGet<T>(key: string) {
        return Maybe.from(this.get<T>(key))
    }

    getBoolean(key: string): boolean {
        const value = this.get(key);
        return value === 'TRUE';
    }

    getNumber(key: string): number {
        const value = this.get<GameValue>(key);
        return value.value;
    }

    mapKeyValuePairs<V, T>(mapFn: (key: string, value: V) => T) {
        return [...this.dataMap.entries()].map(([key, value]) => mapFn(key, value))
    }

    
    getArray<T>(key: string): T[] {
        return this.get<T[]>(key) || [];
    }
} 

export interface KeyValuePair<T> {
    key: string;
    value: T;
}