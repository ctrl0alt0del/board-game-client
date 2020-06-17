import { Vector3 } from "three";
import { Constraint } from "./Constraint.model";

export class Acceleration {
    constructor(public value: Vector3, public source?: Constraint) {

    }
}