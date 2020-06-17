import {  Ray, Vector3 } from "three";
import { GameObject } from "../GameObject.model";

export abstract class SelectStrategy<T extends GameObject = GameObject> {
    constructor(protected instance: T) {

    }
    abstract isHovered(ray: Ray): Vector3;
}