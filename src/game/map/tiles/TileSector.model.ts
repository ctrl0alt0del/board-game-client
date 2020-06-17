import { Vector2, Color } from "three";
import { Tile } from "./Tile";
import { SectorRef } from "../../../state/GameState.interface";

export enum SectorModification {
    None,
    Radiation,
    Mountain
}

export enum EncounterType {
    City,
    Wasteland
}

export interface EncounterPlace {
    type: EncounterType,
    level: number
}

export class TileSector {
    tile: Tile;
    constructor(
        readonly intileID: number,
        readonly colorCode: Color,
        readonly center: Vector2,
        readonly sectorModification: SectorModification,
        readonly encounterPlace: EncounterPlace,
        readonly enemyType: string
    ) {
    }

    toGameState(): SectorRef {
        return {
            intileID: this.intileID,
            tile: this.tile.getState()
        }
    }

}