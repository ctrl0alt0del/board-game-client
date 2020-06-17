import { DiceThrowResult } from "../DieResult.interface";
import { DiceThrowScore } from "../DiceThrowScore.interface"; 

export type DiceThrowModificationFunction = (result: DiceThrowResult, prevScore: DiceThrowScore) => DiceThrowScore;

export const defaultCheckDiceThrowCalculator: DiceThrowModificationFunction = (result) => {
    return {
        badPoints: 0,
        goodPoints: result.reduce((total, current) => total + current.normalHitsCount,0)
    };
}