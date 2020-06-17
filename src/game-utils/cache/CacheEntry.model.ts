import { AssetsEntryType, AssetsObject } from "../assets/AssetsService.interface";



export class CacheEntry {
    constructor(readonly key: string,readonly type: AssetsEntryType, readonly object: AssetsObject) {

    }
}