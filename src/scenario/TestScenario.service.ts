import { Injectable, Inject } from "injection-js";
import { Scenario } from "./Scenario.model";
import { TileState } from "../state/GameState.interface";
import { AVAILABLE_TILES } from "../game/map/Map.utils";
import { AssetsDefineObject, AssetsEntryType } from "../game-utils/assets/AssetsService.interface";

@Injectable()
export class TestScenario extends Scenario {


    preloadDependency(globalDep: AssetsDefineObject): AssetsDefineObject {
        const output: AssetsDefineObject = Object.assign({}, globalDep);
        for (const tileConfig of AVAILABLE_TILES) {
            const { name, back } = tileConfig;
            Object.assign(output, {
                [name]: {
                    type: AssetsEntryType.Tile,
                    config: {
                        name: name,
                        back: back
                    }
                }
            });
        }
        Object.assign(output, {
            table_color_map: {
                type: AssetsEntryType.Texture,
                config: { loadUrl: '/text/table_texture.jpg' },
            },
            table_normal_map: {
                type: AssetsEntryType.Texture,
                config: { loadUrl: '/text/table_texture_n.png' },
            }
        })
        Object.assign(output, {
            feral_ghoul_token: {
                type: AssetsEntryType.Texture,
                config: {
                    loadUrl: '/text/enemies/feral_ghoul_token.png'
                }
            }
        } as AssetsDefineObject);

        Object.assign(output, {
            player_miniature: {
                type: AssetsEntryType.Mesh,
                config: {
                    loadUrl: '/obj/brotherhood_unit.gltf'
                }
            }
        } as AssetsDefineObject)
        return output;
    }
    generateMapState(): TileState[] {
        const tilesArrayLength = AVAILABLE_TILES.length;
        const sideSize = Math.floor(Math.sqrt(tilesArrayLength));
        return AVAILABLE_TILES.map((tileData, index) => {
            const i = Math.floor(index / sideSize);
            const j = index % sideSize;
            return {
                position: { i, j },
                isFlipped: !tileData.back,
                tileName: tileData.name
            }
        })
    }

}