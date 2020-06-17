import { Injectable, Inject } from "injection-js";
import { CacheService } from "../cache/Cache.service";
import { Texture, Mesh, SkinnedMesh } from "three";
import { MeshConfig } from "../../meshes/MeshConfig.interface";
import { TextureConfig } from "../../meshes/textures/TextureConfig.interface";
import { CacheEntry } from "../cache/CacheEntry.model";
import { MeshFactory, SkinnedMeshFactoryResult } from "../../meshes/MeshFactory";
import { Tile } from "../../game/map/tiles/Tile";
import { TileConfig } from "../../game/map/tiles/TileConfig.interface";
import { TexturesFactory } from "../../meshes/textures/Textures.factory";
import { TilesFactory } from "../../game/map/tiles/Tiles.factory";
import { GameObjectProducer } from "../../game/game-object/GameObjectProducer.model";
import { IAssetsService, AssetsConfig, AssetsEntryType, AssetsObject, AssetsDefineObject } from "./AssetsService.interface";
import { Config } from "electron";

@Injectable()
export class AssetsService implements IAssetsService {

    private defines = new Map<string, AssetsConfig>();

    constructor(
        @Inject(CacheService) private cache: CacheService,
        @Inject(MeshFactory) private meshes: MeshFactory,
        @Inject(TexturesFactory) private textures: TexturesFactory,
        @Inject(TilesFactory) private tilesFactory: TilesFactory
    ) {
        tilesFactory.assetsProvider = this;
    }

    defineAssets(dict: AssetsDefineObject) {
        for (const key in dict) {
            const config = dict[key];
            this.defines.set(key, config);
        }
    }

    async loadDefinedAssets() {
        for (const [key, assetConfig] of this.defines.entries()) {
            const { type, config } = assetConfig;
            const object = await this._safeLoadAsset(type, config as any);
            this.cache.add(new CacheEntry(key, type, object));
        }
    }

    async get<T>(key: string): Promise<T> {
        const assetConfig = this.defines.get(key);
        if (assetConfig) {
            const cacheEntry = this.cache.get(assetConfig.type, key);
            if (cacheEntry) {
                return cacheEntry as any;
            } else {
                const asset = await this._safeLoadAsset(assetConfig.type, assetConfig.config as any);
                this.cache.add(new CacheEntry(key, assetConfig.type, asset));
                return asset as any;
            }
        }
    }

    private _safeLoadAsset(type: AssetsEntryType, config: Config): Promise<AssetsObject> {
        switch (type) {
            case AssetsEntryType.Mesh:
                return this.meshes.importSimpleMesh(config as MeshConfig, true);
            case AssetsEntryType.Meshes:
                return this.meshes.importSimpleMesh(config as MeshConfig, false);
            case AssetsEntryType.SkinnedMesh:
                return this.meshes.factory(config as MeshConfig);
            case AssetsEntryType.Texture:
                return this.textures.load(config as TextureConfig);
            case AssetsEntryType.Tile:
                return this.tilesFactory.create(config as TileConfig)
        }
    }
}