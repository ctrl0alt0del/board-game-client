import { Lens, LensUtils } from "./StateLens.utils";
import { GameState, PlayerState } from "../../state/GameState.interface";

export class StateLensFactory {

    static getPlayerInventory() {
        return LensUtils.compose(
            LensUtils.key<GameState, 'currentPlayer'>("currentPlayer"),
            LensUtils.key<PlayerState, "inventory">("inventory")
        )
    }

    static addToPlayerInventory() {
        return LensUtils.compose(
            this.getPlayerInventory(),
            LensUtils.push()
        )
    }

    static getEquipedItems() {
        return LensUtils.compose(
            this.getPlayerInventory(),
            LensUtils.filter(item => item.isEquiped)
        )
    }
}