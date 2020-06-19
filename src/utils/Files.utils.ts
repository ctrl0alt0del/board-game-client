import { FileLoader } from "three";
import { Reader, AsyncReader } from "./fp/Reader";
import { Observable, from, pipe } from "rxjs";
import { swapArg, compose, constant } from "./Functions.utils";
import { typeOf, match, parseJSON } from "./Common.utils";
import { map } from "rxjs/operators";
import { Either } from "./fp/Either";



export const loadFileViaLoader = (path: string) => {
    return new AsyncReader((loader: FileLoader) => {
        return new Promise<string | ArrayBuffer>((resolve, reject) => {
            loader.load(path, resolve, null, reject);
        })
    })
}

export const loadFile = (path: string) => from(new Promise<string|ArrayBuffer>((res, rej) => new FileLoader().load(path, res, null, rej)));

export const loadTextFile = compose(
    loadFile,
    pipe(
        map(result => Buffer.from(result).toString()),
    )
)

export const loadJsonFile = <T>(path: string): Observable<T> => compose(
    loadTextFile,
    pipe(map(parseJSON))
)(path)