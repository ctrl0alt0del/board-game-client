import { MeshConfig } from "../../meshes/MeshConfig.interface";
import { GameAbilities } from "../GameConstants.utils";
import { EnemyType } from "./Enemy.model";
import { VATSHitType } from "../dice/DieResult.interface";
import { VATSHit } from "../dice/VATSHit.model";

export interface EnemyConfig {
    key: string
    type: EnemyType
    tokenTextureName: string,
    enemyImageSrc: string,
    level: number,
    name: string, 
    abilities: GameAbilities[],
    weakBodyParts: VATSHit[]
    enemyMeshConfig?: MeshConfig
}