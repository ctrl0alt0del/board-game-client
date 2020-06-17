import { Inject, Injectable } from "injection-js";
import { SceneComposer } from "../../../scene/SceneComposer";
import { TexturesFactory } from "../../../meshes/textures/Textures.factory";
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnsignedByteType, PMREMGenerator, Mesh, PlaneBufferGeometry, MeshBasicMaterial, RepeatWrapping, Vector2, MeshPhysicalMaterial, Color, MeshPhongMaterial, Object3D, Matrix4, Vector3, Quaternion, Euler, Texture } from "three";
import { RenderingPipelineService } from "../../../render/RenderingPipeline.service";
import { MeshFactory } from "../../../meshes/MeshFactory";
import { MathUtils } from "../../../utils/Math.utils";
import { AssetsService } from "../../../game-utils/assets/Assets.service";

@Injectable()
export class WorldService{
    constructor(
        @Inject(SceneComposer) private sceneComposer: SceneComposer,
        @Inject(RenderingPipelineService) private pipeline: RenderingPipelineService,
        @Inject(MeshFactory) private meshes: MeshFactory,
        @Inject(TexturesFactory) private textures: TexturesFactory,
        @Inject(AssetsService) private assets: AssetsService
    ) {
        //this.createTable();
        //this.createBackgroundMisc();
        //this.initializeBackground();
    }

    initializeBackground(){
        new RGBELoader().setDataType(UnsignedByteType)
        .load('/env/venice_sunset_1k.hdr', texture => {
            const gen = new PMREMGenerator(this.pipeline.renderer);
            gen.compileEquirectangularShader();
            const envTexture = gen.fromEquirectangular(texture).texture;
            this.sceneComposer.scene.background = envTexture;
        })
    }
    async createTable() {
        const textureOptions =  {
            repeat: new Vector2(2,10),
            wrapS: RepeatWrapping,
            wrapT: RepeatWrapping
        }
        const color = await this.assets.get<Texture>('table_color_map');
        Object.assign(color, textureOptions)
        const normal = await this.assets.get<Texture>('table_normal_map');
        Object.assign(normal, textureOptions)
        const tableMesh = new Mesh(new PlaneBufferGeometry(3500, 8000), new MeshPhongMaterial({
            map: color,
            normalMap: normal,
            reflectivity: 10,
            color: 0xffcccc,
        }));
        tableMesh.receiveShadow = true;
        tableMesh.position.set(1000, 1600, -10);
        this.sceneComposer.scene.add(tableMesh);
    }

    async createBackgroundMisc() {
        /*const ashtrayMatrix = new Matrix4().compose(new Vector3(-370, 370, -10), new Quaternion().setFromEuler(new Euler(0, MathUtils.toRad(0), MathUtils.toRad(-180))), new Vector3(35, 35, 35));
        const ashtray = await this.meshes.importSimpleMesh({ loadUrl: 'obj/misc/ashtray.glb' }, false);
        this.addMiscObj(ashtray, ashtrayMatrix)*/
        
    }

    private async addCaps(position: Vector3) {
        const rotation = 160 + Math.random() * 60;
        const capsMatrix = new Matrix4().compose(position, new Quaternion().setFromEuler(new Euler(0, MathUtils.toRad(-20), MathUtils.toRad(rotation))), new Vector3(5, 5, 5));
        const caps = await this.meshes.importSimpleMesh({ loadUrl: 'obj/misc/caps.glb' }, false);
        this.addMiscObj(caps, capsMatrix);
    }

    private addMiscObj(misc: Mesh[], matrix: Matrix4) {
        const group = new Object3D();
        group.add(...misc);
        group.applyMatrix4(matrix);
        group.traverse(obj => {
            obj.castShadow = true;
            obj.receiveShadow = true;
        });
        this.sceneComposer.scene.add(group);
    }
}