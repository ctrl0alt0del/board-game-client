import { Vector3 } from "three";
import { Acceleration } from './Acceleration.model';
import { Constraint } from "./Constraint.model";
import { Maybe } from '../utils/fp/Maybe';

export class Point {
    position: Vector3;
    previousPositions: Vector3[] = [];
    damping = .15;

    get kineticEnergy() {
        return this.velocity.length() / 2;
    }

    constructor(initialPosition: Vector3, public velocity: Vector3) {
        this.position = initialPosition;
    }

    *update(deltaTime: number, acceleration: Vector3 = new Vector3()) {
        const previousPosition = this.position.clone();
        this.previousPositions = this.previousPositions.slice(this.previousPositions.length > 1 ? 1 : 0).concat(previousPosition)
        this.position.addScaledVector(this.velocity, deltaTime).addScaledVector(acceleration, deltaTime * deltaTime / 2);
        const newAcceleration: Vector3 = yield;
        this.velocity.addScaledVector(newAcceleration.clone().add(acceleration), deltaTime / 2).multiplyScalar(1 - this.damping * deltaTime);
        return;
    }

    consumeKineticEnergy(amount: number) {
        const nextEnergy = (1 - amount) * this.kineticEnergy;
        this.velocity.multiplyScalar(Math.sqrt(2 * nextEnergy));
    }
}