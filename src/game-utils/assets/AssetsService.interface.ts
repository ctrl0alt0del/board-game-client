import { Texture, Mesh } from "three";
import { SkinnedMeshFactoryResult } from "../../meshes/MeshFactory";
import { Tile } from "../../game/map/tiles/Tile";
import { GameObjectProducer } from "../../game/game-object/GameObjectProducer.model";
import { MeshConfig } from "../../meshes/MeshConfig.interface";
import { TextureConfig } from "../../meshes/textures/TextureConfig.interface";
import { TileConfig } from "../../game/map/tiles/TileConfig.interface";

export type AssetsObject = Texture | Mesh | SkinnedMeshFactoryResult | Tile | Mesh[] | GameObjectProducer<Tile>;

type Config = MeshConfig | TextureConfig | TileConfig;

export type AssetsDefineObject = {
    [keys: string]: AssetsConfig;
}; 

export type AssetsConfig = {
    type: AssetsEntryType.Texture,
    config: TextureConfig
} | {
    type: AssetsEntryType.Mesh | AssetsEntryType.Meshes | AssetsEntryType.SkinnedMesh,
    config: MeshConfig
} | {
    type: AssetsEntryType.Tile,
    config: TileConfig
};

export enum AssetsEntryType {
    Texture,
    Mesh,
    Meshes,
    SkinnedMesh,
    Tile
}

export interface IAssetsService {
    get<T>(assetName: string): Promise<T>;
}