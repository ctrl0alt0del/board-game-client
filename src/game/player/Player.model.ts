import { v4 } from "uuid";
import { Character } from "../game-object/characters/Character";
import { TileSector } from "../map/tiles/TileSector.model";
import { PlayerState } from "../../state/GameState.interface";
import { GameActive } from "../active/GameActive.model";
import { GameInventoryItem } from "../active/GameInventoryItem.model";
import { PrimaryStatistics } from "../../game-logic/data/Constants.utils";

export class Player {
    character: Character;
    sector: TileSector;
    statistics: PrimaryStatistics[] = [PrimaryStatistics.Perception, PrimaryStatistics.Agility];
    inventory: GameInventoryItem[] = [];
    capsAmout: number = 3;
    expiriencePoint = 0;
    healthPoint = 20;
    level = 1;
    radiationPoint = 0;
    constructor(readonly id?: string) {
        if (!id) {
            this.id = v4();
        }
    }

    toGameState(): PlayerState {
        return {
            id: this.id,
            statistics: this.statistics,
            sector: this.sector.toGameState(),
            capsAmount: this.capsAmout,
            expiriencePoint: this.expiriencePoint,
            healtpPoint: this.healthPoint,
            level: this.level,
            radiationPoint: this.radiationPoint
        }
    }
}