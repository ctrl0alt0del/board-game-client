import { Object3D, Mesh, Box3, Vector2, Vector3 } from "three";
import { Injector, Type } from "injection-js";
import { Probably, Maybe } from "./fp/Maybe";
import { ArrayUtils } from "./Array.utils";
import { compose } from "./Functions.utils";
import { Observable } from "rxjs";

interface AnimationFramesRefObject {
    id: Probably<number>
    started: number,
    prevTick: number,
    canceled: boolean
}

export const requestAnimationFrames = (cb: (passed: number, delta: number) => void) => {
    let output: AnimationFramesRefObject = { id: null, started: Date.now(), prevTick: Date.now(), canceled: false };
    const tick = () => {
        cb(Date.now() - output.started, Date.now() - output.prevTick);
        output.prevTick = Date.now();
        if (output.canceled) {
            return;
        }
        output.id = requestAnimationFrame(tick)
    }
    output.id = requestAnimationFrame(tick);
    return output;
}

export const cancelRequestAnimationFrames = (idObj: AnimationFramesRefObject) => {
    idObj.canceled = true;
    Maybe.from(idObj.id).map(cancelAnimationFrame);
}

export const getObject3DMeshes = (object: Object3D): Mesh[] => {
    if ((object as Mesh).isMesh) {
        return [object as Mesh];
    } else {
        return object.children.reduce<Mesh[]>((total, child) => total.concat(getObject3DMeshes(child)), []);
    }
}

export const getNestedMesh = <T extends Mesh>(object: Object3D): T => {
    const nestedMeshes = getObject3DMeshes(object);
    if (nestedMeshes.length > 1) {
        console.warn('getNestedMesh: more than 1 nested meshes were found. The first one will be returned.');
    }
    return nestedMeshes[0] as T;
}

export const mergeBoxes = (...objects: Object3D[]) => {
    let result = new Box3();
    for (const object of objects) {
        result = result.expandByObject(object);
    }
    return result;
}

export const wait = (ms: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    })
}

export const playUIAudio = (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    audio.play();
    return audio.duration;
}

export const rangeArray = (end: number, start: number = 0) => {
    return new Array(end + 1 - start).fill(0).map((_, i) => i + start);
}

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const lerpNumbers = (a: number, b: number, t: number) => {
    return a * (1 - t) + b * t;
}

export enum Vector3Components {
    X = 1,
    Y = 2,
    Z = 4,
    XY = 1 | 2,
    YZ = 2 | 4,
    XZ = 1 | 4,
}

export const pickVectorComponent = (vec: Vector3, componentType: Vector3Components) => {
    const comp: [number, number, number] = [0, 0, 0];
    if((componentType & Vector3Components.X) === Vector3Components.X) {
        comp[0] = vec.x;
    }
    if((componentType & Vector3Components.Y) === Vector3Components.Y) {
        comp[1] = vec.y;
    }
    if((componentType & Vector3Components.Z) === Vector3Components.Z) {
        comp[2] = vec.z;
    }
    return new Vector3(...comp);
}

export const getRandomSign = (): 1 | 0 | -1 => {
    const random = Math.random();
    return random < .5 ? 1  : -1;
}

export const maybeGet = <K,V>(map: Map<K,V>, key: K) : Maybe<V> => {
    return Maybe.from(map.get(key));
}

export const equalTo = <A, B>(a: A) => (b: B) => a === b;

export const pickKey = <T, K extends keyof T>(key: K) => (t: T) => t[key];

export function injectorGet<A, B, C>(injector: Injector, typeArray: [Type<A>, Type<B>, Type<C>]): [A, B, C];
export function injectorGet<A, B>(injector: Injector, typeArray: [Type<A>, Type<B>]): [A, B];
export function injectorGet<K>(injector: Injector, typeArray: [Type<K>]): [K];
export function injectorGet(injector: Injector, typeArray: any) {
    return typeArray.map(type => injector.get(type));
}

export const match = <Enum, C>(cases: [Enum, () => C][], def: () => C) =>
 (e: Enum) => Maybe.findInArray(cases, compose(pickKey(0), equalTo(e)))
 .map(pickKey(1)).orDefault(def)();

export const typeOf = <T>(t: T) => typeof t;

export const parseJSON = (str: string) => JSON.parse(str);

export const log = (prefix: string) => <T>(obj: T) => {
    console.log(prefix, obj);
    return obj;
}