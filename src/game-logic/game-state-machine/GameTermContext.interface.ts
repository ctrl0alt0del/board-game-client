import { GameActionCausedByType } from "./GameActionCausedByType.enum";
import { GameEffect } from "../effects/GameEffect.model";

export type GameTermContext = {
    sourceType: GameActionCausedByType.GameEffect,
    source: GameEffect
}