import { Box3, Ray } from "three";

export class MathUtils {
    static polarToCartesian(r, angle) {
        return {
            x: r * Math.cos(angle),
            y: r * Math.sin(angle)
        }
    }

    static toRad(deg: number) {
        return deg * 0.0174533;
    }
}