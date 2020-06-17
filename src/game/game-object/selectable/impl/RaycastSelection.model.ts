import { SelectStrategy } from "../SelectStrategy.model";
import { Vector3, Raycaster, Ray } from "three";

export class RaycastSelection extends SelectStrategy {
    isHovered(ray: Ray) {
        const raycaster = new Raycaster(ray.origin, ray.direction);
        const intersectionResult = raycaster.intersectObject(this.instance.object3d, true);
        if(intersectionResult && intersectionResult.length > 0) {
            return intersectionResult[0].point;
        } else {
            return null;
        }
    }
}