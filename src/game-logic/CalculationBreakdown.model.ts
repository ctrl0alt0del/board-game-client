import { GameEffect, GameEffectOperation, GameEffectOperationType } from "./effects/GameEffect.model";
import { GameEffectDisplayData } from "./effects/Displayable.interface";

export type withDisplayable = {
    displayable: GameEffectDisplayData
}

export interface CalculationItem {
    operation: GameEffectOperation;
    source: withDisplayable;
}

export class CalculationBreakdown{
    
    get result() {
        return this.additions.reduce((total, current) => {
            return current.operation.function(total);
        },0)
    }

    constructor(readonly additions: CalculationItem[]) {

    }
}