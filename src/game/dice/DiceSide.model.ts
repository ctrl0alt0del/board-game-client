import { DiceSideType, VATSHitType } from "./DieResult.interface";
import { Vector3 } from "three";
import { MathUtils } from "../../utils/Math.utils";

export interface DieSide {
    type: DiceSideType;
    vatsHits: VATSHitType[];
    normalHitsCount: number;
    dieRotation: Vector3;
}

const DiceLib: {[key in DiceSideType]: DieSide} = {
    [DiceSideType.ArmsOneHit]: {
        type: DiceSideType.ArmsOneHit,
        vatsHits: [VATSHitType.Arms],
        normalHitsCount: 1,
        dieRotation: new Vector3(0, MathUtils.toRad(90), 0)
    },
    [DiceSideType.Body]: {
        type: DiceSideType.Body,
        vatsHits: [VATSHitType.Body],
        normalHitsCount: 0,
        dieRotation: new Vector3(0,0,0)
    },
    [DiceSideType.BodyArmsLegsTowHits]: {
        type: DiceSideType.BodyArmsLegsTowHits,
        vatsHits: [VATSHitType.Arms, VATSHitType.Body, VATSHitType.Legs],
        normalHitsCount: 2,
        dieRotation: new Vector3(MathUtils.toRad(180), 0, 0)
    },
    [DiceSideType.BodyOneHit]: {
        type: DiceSideType.BodyOneHit,
        vatsHits: [VATSHitType.Body],
        normalHitsCount: 1,
        dieRotation: new Vector3(MathUtils.toRad(90), 0, 0)
    },
    [DiceSideType.HeadOneHit]: {
        type: DiceSideType.HeadOneHit,
        vatsHits: [VATSHitType.Head],
        normalHitsCount: 1,
        dieRotation: new Vector3(0, MathUtils.toRad(90), 0)
    },
    [DiceSideType.Legs]: {
        type: DiceSideType.Legs,
        vatsHits: [VATSHitType.Legs],
        normalHitsCount: 0,
        dieRotation: new Vector3(MathUtils.toRad(-90), MathUtils.toRad(90), 0)
    }
}

export const getDiceSide = (type: DiceSideType) => DiceLib[type];