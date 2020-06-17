import { GameLogicTerm } from "../../game-logic/game-state-machine/GameTerms";
import { GameEffect } from "../../game-logic/effects/GameEffect.model";
import { GameEntity } from "../../game-logic/GameEntity.model";
import { InventoryItemState } from "../../state/GameState.interface";

export enum ActiveType {
    Loot,
    Asset,
    UniqueAsset
}

export const getActiveType = (str: string) => {
    return ActiveType[str] || ActiveType.Loot;
}

export interface GameActive {
    entity?: GameEntity;
    id: string;
    image: string,
    name: string;
    description: string;
    kind: string;
    type: ActiveType,
    effects: GameEffect[];
    toGameState(owner: string, isEquiped: boolean): InventoryItemState
}