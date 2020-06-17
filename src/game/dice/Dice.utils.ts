import { DiceSideType } from "./DieResult.interface";
import { Vector3 } from "three";
import { MathUtils } from "../../utils/Math.utils";
import { createSimplePhase } from "../phases/SimpleGamePhase.model";
import { ThrowDicePhase } from "../phases/phase-impl/PhaseDataImpl.interface";
import { PhaseType } from "../phases/PhaseType.enum";
import { GameStateService } from "../../state/GameState.service";
import { StateLensFactory } from "../../utils/lens/StateLens.factory";
import { getDiceSide } from "./DiceSide.model";

export const getDieRotationForFacingSide = (side: DiceSideType) => {
    switch(side) {
        case DiceSideType.Body: {
            return new Vector3(0,0,0);
        }
        case DiceSideType.BodyOneHit: {
            return new Vector3(MathUtils.toRad(90), 0, 0);
        }
        case DiceSideType.HeadOneHit: {
            return new Vector3(0, MathUtils.toRad(90), 0);
        }
        case DiceSideType.Legs: {
            return new Vector3(MathUtils.toRad(-90), MathUtils.toRad(90), 0);
        }
        case DiceSideType.BodyArmsLegsTowHits: {
            return new Vector3(MathUtils.toRad(180), 0, 0);
        }
        case DiceSideType.ArmsOneHit: {
            return new Vector3(0, MathUtils.toRad(90), 0);
        }
        default: return new Vector3();
    }
}

export const throwDice = (dieCountsToThrow: number) => {
    const result = new Array(dieCountsToThrow).fill(0).map(_ => getDiceSide(Math.floor(Math.random() * 6)));
    return createSimplePhase<ThrowDicePhase>({
        name: PhaseType.DiceThrow,
        diceThrowResult: result 
     }, async injector => injector.get(GameStateService).patchChanges([StateLensFactory.currentDiceCheckRounds.add(result)]));
}

export const initDiceThrow = 