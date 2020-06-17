import { DieSide } from "./DiceSide.model";

export enum VATSHitType {
    Head,
    Body,
    Legs,
    Arms
}

export enum DiceSideType {
    Legs,
    BodyOneHit,
    BodyArmsLegsTowHits,
    ArmsOneHit,
    Body,
    HeadOneHit
}


export type DiceThrowResult = DieSide[];
