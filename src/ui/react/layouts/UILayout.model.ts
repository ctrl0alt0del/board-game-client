import { Vector2 } from "three";

export abstract class UILayout {
    abstract getCoords(index: number): Vector2;
}