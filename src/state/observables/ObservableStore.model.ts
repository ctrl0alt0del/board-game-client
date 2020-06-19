import { Observable, Subject } from "rxjs";

export interface IObservableStore {
    map: Map<string, Observable<any>>;
}

const setMapEntry = (key: string, value: any, map: Map<string, any>) => {
    map.set(key, value);
    return map;
}

export class ObservableStore {
    static create(dict: {[key:string]: Observable<any>}): IObservableStore {
        
        return {
            map: Object.entries(dict).reduce((map, [key, observable]) => setMapEntry(key, observable, map), new Map<string, Observable<any>>())
        }
    }

    static get<T>(token: string) {
        return (store: IObservableStore) => store.map.get(token) as Observable<T>;
    }

    static subject<T>(token: string): (store: IObservableStore) => Subject<T> {
        return this.get<T>(token) as any;
    }
}