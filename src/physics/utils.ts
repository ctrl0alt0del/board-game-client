import { Vector3 } from "three";

export const getAccelerationVectorForPoints = (a: Vector3, b: Vector3, time: number) => {
    const scale = 2 / (time * time);
    return new Vector3().subVectors(b, a).multiplyScalar(scale);
}

export const getGravityAcceleration = (height: number, time: number) => {
    return getAccelerationVectorForPoints(new Vector3(0, 0, height), new Vector3(), time);
}

export const getVelocityVector = (posA: Vector3, posB: Vector3, time: number) => {
    const diff = new Vector3().subVectors(posB, posA);
    return diff.multiplyScalar(1  / time);
}