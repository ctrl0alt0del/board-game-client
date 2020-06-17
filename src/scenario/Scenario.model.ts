import { TileState } from "../state/GameState.interface";
import { AssetsDefineObject } from "../game-utils/assets/AssetsService.interface";


export abstract class Scenario {
    abstract preloadDependency(globalDep: AssetsDefineObject): AssetsDefineObject;
    abstract generateMapState(): TileState[];
}