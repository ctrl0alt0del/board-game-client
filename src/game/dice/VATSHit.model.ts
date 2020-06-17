import { VATSHitType } from "./DieResult.interface";

export interface VATSHit {
    type: VATSHitType;
    image: string;
}

const VATSHitLib: {[key in VATSHitType]: VATSHit} = {
    [VATSHitType.Arms] : {
        type: VATSHitType.Arms,
        image: 'text/vats/arms.png'
    },
    [VATSHitType.Legs] : {
        type: VATSHitType.Legs,
        image: 'text/vats/legs.png'
    },
    [VATSHitType.Body] : {
        type: VATSHitType.Body,
        image: 'text/vats/body.png'
    },
    [VATSHitType.Head] : {
        type: VATSHitType.Head,
        image: 'text/vats/head.png'
    }
}

export const getVATSHitByType = (type: VATSHitType) => {
    return VATSHitLib[type];
}