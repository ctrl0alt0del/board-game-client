import { Injectable } from "injection-js";
import { CacheEntry} from "./CacheEntry.model";
import { AssetsObject, AssetsEntryType } from "../assets/AssetsService.interface";

@Injectable()
export class CacheService{
    private cacheMap = new Map<AssetsEntryType, Map<string, AssetsObject>>();
    add(entry: CacheEntry) {
        let typeMap = this.cacheMap.get(entry.type);
        if(!typeMap) {
            typeMap = new Map<string, AssetsObject>();
            this.cacheMap.set(entry.type, typeMap);
        }
        typeMap.set(entry.key, entry.object);
    }

    get(type: AssetsEntryType, key: string) {
        const typeMap = this.cacheMap.get(type);
        if(typeMap) {
            return typeMap.get(key);
        }
        return undefined;
    }
}