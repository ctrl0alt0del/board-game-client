import { MathUtils } from "./Math.utils";
import { Vector2 } from "three";

const pi = Math.PI;

export class HexagonUtils {
    static getEdgeCoordinates(edgeNumber: number, hexWidth: number, hexCenter: Vector2) {
        const angle = edgeNumber * pi / 3 + pi / 6 - pi/3;
        return new Vector2(Math.sin(angle), -Math.cos(angle)).multiplyScalar(hexWidth/2).add(hexCenter);
    }
}