import { GameActive } from "./GameActive.model";

export interface GameItem extends GameActive {
    cost: number
}