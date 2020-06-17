import { FileLoader } from "three";
import { Reader, AsyncReader } from "./fp/Reader";


export const loadFileViaLoader = (path: string) => {
    return new AsyncReader((loader: FileLoader) => {
        return new Promise<string | ArrayBuffer>((resolve, reject) => {
            loader.load(path, resolve, null, reject);
        })
    })
}