import { TilePositionManager } from "../TilePositionManager.interface";
import { TilePosition } from "../../TilePosition.model";
import { Vector2 } from "three";
import { Injectable, Inject } from "injection-js";

const SQRT_3 = Math.sqrt(3);
const SQRT_3_2 = SQRT_3 / 2;
const N_3_2 = 3/2;

@Injectable()
export class AxialTilePositionManager extends TilePositionManager {
    getCartesian({i,j}: TilePosition, size: number = this.size) {
        const y = size * (SQRT_3 * i + SQRT_3_2 * j);
        const x = size * ( N_3_2 * j);
        return new Vector2(x, y)
    }
}