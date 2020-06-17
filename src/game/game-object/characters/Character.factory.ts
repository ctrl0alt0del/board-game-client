import { Injectable, Inject } from "injection-js";
import { SkinnedMeshFactoryResult } from "../../../meshes/MeshFactory";
import { Character } from "./Character";
import { Mesh } from "three";
import { AnimatedCharacter } from "./animated-characters/AnimatedCharacter.model";
import { TexturesFactory } from "../../../meshes/textures/Textures.factory";
import { AssetsService } from "../../../game-utils/assets/Assets.service";

@Injectable()
export class CharacterFactory {
    constructor(
        @Inject(AssetsService) private assets: AssetsService,
        @Inject(TexturesFactory) private textures: TexturesFactory
    ) {

    }
    async create(assetsName: string) {
        const loadedMesh = await this.assets.get<Mesh | SkinnedMeshFactoryResult>(assetsName);
        let result: Character;
        if ('object' in loadedMesh) {
            result = new AnimatedCharacter();
            result.characterObject = loadedMesh.object;
            for (const [key, value] of loadedMesh.animationMap) {
                (result as AnimatedCharacter).setClip(key, value);
            }
        } else {
            result = new Character();
            result.characterObject = loadedMesh;
        }
        /*if (config.textureUrl) {
            const texture = await this.textures.load({ loadUrl: config.textureUrl });
            result.setMapTexture(texture);
        }*/
        return result;
    }
}