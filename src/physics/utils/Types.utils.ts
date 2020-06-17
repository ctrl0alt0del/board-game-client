import { Point } from "../Point.model";
import { Constraint } from "../Constraint.model";
import { Acceleration } from "../Acceleration.model";
import { Vector3 } from "three";

export interface PointUpdateResult {
    targetPoint: Point,
    activeConstraints: Constraint[]
}

export interface ConstraintResolveResult {
    acceleration: Vector3,
    constraints: Constraint[]
}