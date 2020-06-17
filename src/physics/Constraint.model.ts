import { Vector3 } from "three";
import { Acceleration } from "./Acceleration.model";
import { Point } from "./Point.model";
import { Maybe, Probably } from "../utils/fp/Maybe";

export abstract class Constraint {

    protected abstract getAcceleration(point: Point, timeDelta: number): Probably<Acceleration>;

    constrain(point: Point, timeDelta: number): Maybe<Acceleration> {
        return Maybe.from(this.getAcceleration(point, timeDelta)).map(acc => {
            acc.source = this;
            return acc;
        });
    }
}