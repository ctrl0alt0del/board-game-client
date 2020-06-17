import { PhaseData } from "../PhaseData.interface";
import { Player } from "../../player/Player.model";
import { TileSector } from "../../map/tiles/TileSector.model";
import { Tile } from "../../map/tiles/Tile";
import { Enemy } from "../../enemy/Enemy.model";
import { Combat } from "../../enemy/combat/Combat.model";
import { GameActive } from "../../active/GameActive.model";
import { DiceCheck } from "../../dice/DiceCheck.model";
import { DiceThrowResult } from "../../dice/DieResult.interface";

export interface WalkPhaseData extends PhaseData {
    player: Player;
    startSector: TileSector;
    destinationSector: TileSector;
}

export interface ScoutPhaseData extends PhaseData {
    player: Player;
    tile: Tile
}

export interface SpawnEnemyPhaseData extends PhaseData {
    enemy: Enemy;
    sector: TileSector;
    spawnAsActive: boolean;
}

export interface CombatPhaseData extends PhaseData {
    combat: Combat
}

export interface DrawActivePhase extends PhaseData {
    active: GameActive
}

export interface ThrowDicePhase extends PhaseData {
    diceThrowResult: DiceThrowResult
}