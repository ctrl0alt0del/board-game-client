import { Injectable, Inject } from "injection-js";
import { Tile, TileProducer, TileProducerOptions, TileType } from "./Tile";
import { TexturesFactory } from "../../../meshes/textures/Textures.factory";
import { TILE_SIZE } from "../../../common/InjectionTokens.utils";
import { MeshFactory } from "../../../meshes/MeshFactory";
import { TileModelParser } from "../../../parsers/TileModelParser.service";
import { TileConfig } from "./TileConfig.interface";
import { IAssetsService, AssetsEntryType, AssetsDefineObject} from "../../../game-utils/assets/AssetsService.interface";
import { Mesh, Texture } from "three";

const TILE_MESH_FACE_LOAD_URL = 'obj/tile_face.gltf'

@Injectable()
export class TilesFactory {

    assetsProvider: IAssetsService;

    constructor(
        @Inject(TexturesFactory) private textures: TexturesFactory,
        @Inject(TILE_SIZE) private tileSize: number,
        @Inject(MeshFactory) private meshFactory: MeshFactory,
        @Inject(TileModelParser) private tileModelParser: TileModelParser
    ) {

    }

    get assetsDependency(): AssetsDefineObject {
        const object: AssetsDefineObject = {
            uniformclouds: {
                type: AssetsEntryType.Texture,
                config: {
                    loadUrl: 'text/uniformclouds.jpg'
                }
            },
            tile_face_mesh: {
                type: AssetsEntryType.Mesh,
                config: {loadUrl: TILE_MESH_FACE_LOAD_URL}
            }
        }
        return object;
    }

    async create(tileConfig: TileConfig) {
        try {
            const { name, back } = tileConfig;
            const tileFaceTexPath = `text/tiles/tile_${name}.png`;
            const tileSectorMapTexPath = `text/tiles/${name}.png`;
            const {geometry, material} = await this.assetsProvider.get<Mesh>('tile_face_mesh');
            const faceTex = await this.textures.load({ loadUrl: tileFaceTexPath });
            const sectorMapTex = await this.textures.load({ loadUrl: tileSectorMapTexPath });
            const backTex = back && await this.textures.load({ loadUrl: `text/tiles/${back}.jpg` });
            const { graph, sectors } = await this.tileModelParser.parse(`models/tiles/${name}.txt`, sectorMapTex);
            const cloudTexture = await this.assetsProvider.get<Texture>('uniformclouds');
            return TileProducer.setArgs({
                width: this.tileSize,
                tileBackTexture: backTex,
                tileFace: new Mesh(geometry, material),
                tileFaceTexture: faceTex,
                sectorMapTex: sectorMapTex,
                sectors,
                graph,
                cloudTexture,
                name,
                type: back ? (back === 'good_back' ? TileType.Safe : TileType.Dangerous) : TileType.None
            } as TileProducerOptions);
        } catch (err) {
            console.error(err)
        }

    }
}