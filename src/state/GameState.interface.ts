import { Player } from "../game/player/Player.model";
import { TilePosition } from "../game/map/TilePosition.model";
import { PrimaryStatistics } from "../game-logic/data/Constants.utils";
import { DiceCheck } from "../game/dice/DiceCheck.model";

export interface SectorRef {
    intileID: number,
    tile: TileState
}

export interface GameEffectState {
    effectId: string;

}

export interface EntityState {
    entityId: string;
    activeEffects: GameEffectState[];
}

export interface InventoryItemState {
    activeId: string;
    isEquiped: boolean;
    owner: PlayerId;
    entityId: string;
}

type PlayerId = string;

export interface PlayerState {
    id: PlayerId,
    statistics: PrimaryStatistics[];
    sector: SectorRef;
    level: number,
    expiriencePoint: number,
    radiationPoint: number,
    healtpPoint: number;
    capsAmount: number;
}

export interface TileState {
    position?: TilePosition;
    tileName: string;
    isFlipped?: boolean
}

export interface EnemyState {
    enemyKey: string;
    sector: SectorRef;
    isActive: boolean;
}

export interface CombatState {
    player: PlayerState;
    enemy: EnemyState;
}

export interface GameState {
    players: PlayerState[];
    currentPlayer: PlayerState;
    map: TileState[],
    enemies: EnemyState[];
    currentCombat: CombatState,
    sideEffectsResult: {[key:string]: any}
    inventory: InventoryItemState[]
    entities: EntityState[],
    currentDiceCheck: DiceCheck | null;
}