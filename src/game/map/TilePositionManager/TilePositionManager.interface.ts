import { TilePosition } from "../TilePosition.model";
import { Vector3, Vector2 } from "three";
import { Inject, InjectionToken, Injectable, forwardRef } from "injection-js";
import { TILE_SIZE } from "../../../common/InjectionTokens.utils";
@Injectable()
export abstract class TilePositionManager {
    static get parameters() {
        return [new Inject(forwardRef(()=>TILE_SIZE))]
    }
    constructor(protected size: number) {  }
    abstract getCartesian(position: TilePosition, size?: number): Vector2;
}