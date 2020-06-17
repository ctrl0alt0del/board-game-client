import { Enemy } from "../Enemy.model";
import { Player } from "../../player/Player.model";

export class Combat {
    constructor(readonly enemy: Enemy, readonly player: Player) {
        
    }
}