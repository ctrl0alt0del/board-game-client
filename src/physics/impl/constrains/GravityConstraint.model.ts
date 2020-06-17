import { Constraint } from "../../Constraint.model";
import { Point } from "../../Point.model";
import { Vector3 } from "three";
import { Acceleration } from "../../Acceleration.model";

export class GravityConstraint extends Constraint {
    getAcceleration(point: Point) {
        if(point.position.z > 0) {
            return new Acceleration(new Vector3(0,0, -9800));
        } else {
            return undefined;
        }
    }
}