import { SelectStrategy } from "../SelectStrategy.model";
import { Vector3, Ray } from "three";
import { Character } from "../../characters/Character";

export class BoundingBoxSelection extends SelectStrategy {
    isHovered(ray: Ray) {
        return ray.intersectBox(this.instance.boundingBox, new Vector3())
    }
}