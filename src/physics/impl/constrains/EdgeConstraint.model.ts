import { Constraint } from "../../Constraint.model";
import { Vector3 } from "three";
import { Point } from "../../Point.model";
import { Acceleration } from "../../Acceleration.model";

export class EdgeConstraint extends Constraint{
    private readonly length: number;
    private get middlePoint(): Vector3 {
        return new Vector3().addVectors(this.start.position, this.end.position).multiplyScalar(.5);
    }
    constructor(private start: Point, private end: Point) {
        super();
        const endVector = end.position;
        const startVector = start.position;
        this.length = endVector.distanceTo(startVector);
    }
    protected getAcceleration(point: Point) {
        const vector = new Vector3().subVectors(point.position, this.middlePoint);
        const normal = vector.clone().normalize();
        const dist = vector.length();
        const koef = (this.length - dist) / dist;
        return new Acceleration(normal.multiplyScalar(koef));
    }
}