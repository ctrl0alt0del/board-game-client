import { GameState } from "./state/GameState.interface";

export const serializeForSave = (gameState: GameState) => {
    return JSON.stringify(gameState);
}

export const unserilizeForLoad = (str: string) => {
    return JSON.parse(str);
}