import { GameObject } from "../game-object/GameObject.model";
import { InteractorBase } from "./InteractorBase.model";
import { Vector2, Vector3 } from "three";

export abstract class GameObjectInteractor<T extends GameObject = GameObject> extends InteractorBase {
    constructor(readonly gameObject: T) {
        super();
    }
    abstract hover(point: Vector3);
    abstract unhover();
    abstract touch(point: Vector3);
}