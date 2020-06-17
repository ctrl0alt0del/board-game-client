import { GameObject } from "./GameObject.model";
import { Type } from "injection-js";

export class GameObjectProducer<T extends GameObject> {
    constructor(private fn: (...args: any[]) => T, private _args?: any[]) {

    }

    setArgs(...args: any[]) {
        return new GameObjectProducer(this.fn, args);
    }

    produce() {
        return this.fn(...this._args);
    }
}