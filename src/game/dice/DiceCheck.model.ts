import { DiceThrowResult } from "./DieResult.interface";

export type DiceRoundsUpdator = (check: DiceCheck, result: DiceThrowResult) => void;

export class DiceCheck {
    rounds: DiceThrowResult[];
}

export const createDiceCheck = () => Object.assign(new DiceCheck(), {rounds: []})