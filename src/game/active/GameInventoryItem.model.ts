import { GameActive } from "./GameActive.model";
import { Player } from "../player/Player.model";
import { InventoryItemState } from "../../state/GameState.interface";

export class GameInventoryItem<T extends GameActive = GameActive> {
    constructor(readonly active: T, public readonly owner: Player, public isEquiped = false) {

    }

    toGameState(): InventoryItemState {
        return {
            activeId: this.active.id,
            isEquiped: this.isEquiped,
            owner: this.owner.id,
            entityId: this.active.id
        }
    }
}