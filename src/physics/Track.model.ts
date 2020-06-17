import { Vector3 } from 'three';
import { Point } from './Point.model';
import { PointUpdateResult } from './utils/Types.utils';
import { Constraint } from './Constraint.model';

type PointTraickItem = {
    position: Vector3,
    activeConstraints: Constraint[]
}

export class PointTrack {

    private pointsUpdateInfoList: PointTraickItem[] = [];

    constructor(readonly duration: number, readonly iterationPerSecond: number) {
    }


    addFromPointUpdate(update: PointUpdateResult) {
        this.pointsUpdateInfoList.push({
            activeConstraints: update.activeConstraints,
            position: update.targetPoint.position.clone()
        })
    }

    get(time: number): PointTraickItem {
        const floatIndex = time * this.iterationPerSecond;
        const intIndex = ~~floatIndex;
        if (floatIndex === intIndex) {
            return this.pointsUpdateInfoList[intIndex];
        } else {
            const lerpKoef = floatIndex - intIndex;
            const a = this.pointsUpdateInfoList[intIndex], b = this.pointsUpdateInfoList[intIndex + 1];
            const result = b ? new Vector3().lerpVectors(a.position, b.position, lerpKoef) : a && a.position;
            return {
                position: result,
                activeConstraints: this.pointsUpdateInfoList[intIndex].activeConstraints
            }
        }
    }
}