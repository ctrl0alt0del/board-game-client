import { ShadowReceiverRecalcStrategy } from "../ShadowReceiverRecalculationStrategy.model";
import { GameObject } from "../../GameObject.model";
import { Tile } from "../../../map/tiles/Tile";
import { Player } from "../../../player/Player.model";

export class PlayerShadowReceiverRecalcStrategy extends ShadowReceiverRecalcStrategy {

    constructor(readonly player: Player) {
        super();
    }

    shouldReceiveShadow(gameObject: GameObject) {
        if(gameObject instanceof Tile) {
            return this.player.sector.tile === gameObject;
        } else {
            return false;
        }
    }
}