import { Constraint } from "../../Constraint.model";
import { Plane, Line3, Ray, Vector3 } from "three";
import { Point } from "../../Point.model";
import { Acceleration } from "../../Acceleration.model";
import { MathUtils } from "../../../utils/Math.utils";

export class PlaneConstraint extends Constraint {

    energyLost = 0.3;

    constructor(private plane: Plane) {
        super();
    }

    protected getAcceleration(point: Point, deltaTime: number) {
        const {position, previousPositions, velocity} = point;
        const line = new Line3(previousPositions[1], position);
        const planeNormal = this.plane.normal;
        const angle = velocity.angleTo(planeNormal)
        if (this.plane.intersectsLine(line) && Math.abs(angle) > MathUtils.toRad(90)) {
            const accVector = planeNormal.clone().multiplyScalar(-2 * velocity.dot(planeNormal)).add(velocity).multiplyScalar((2 - this.energyLost) / deltaTime);
            point.consumeKineticEnergy(1);
            return new Acceleration(accVector);
        }
    }
}