import { GameEffect } from "../game-logic/effects/GameEffect.model";
import { InjectionToken } from "injection-js";
import { GameActionCausedByType } from "../game-logic/game-state-machine/GameActionCausedByType.enum";

export const PlayerCommunicatorInstance = new InjectionToken<PlayerCommunicator>('PlayerCommunicatorInstance');

export type CommunicationContext = {
    causedBy: GameActionCausedByType.GameEffect,
    source: GameEffect
}

export interface PlayerCommunicator {
    requestCaps(count: number, reasonKey: string, context: CommunicationContext): Promise<boolean>
}