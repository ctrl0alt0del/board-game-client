import { MeshConfig } from "./MeshConfig.interface";
import { OBJLoader, FBXLoader, GLTFLoader } from "../three-js-external";
import { Mesh, Group, MeshPhongMaterial, BufferGeometry, DoubleSide, MeshPhysicalMaterial, Color, MeshBasicMaterial, SkinnedMesh, AnimationClip, Object3D } from "three";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { getObject3DMeshes } from "../utils/Common.utils";

export type SkinnedMeshFactoryResult = {
    object: Object3D;
    animationMap: Map<string, AnimationClip>;
};

export class MeshFactory {


    async factory(config: MeshConfig): Promise<Mesh | SkinnedMeshFactoryResult> {
        try {
            if (!config.isSkinned) {
                return this.importSimpleMesh(config, true) as Promise<Mesh>;
            } else {
                return this.importSkinnedMesh(config);
            }
        } catch (err) {
            console.error(err)
        }
    }

    private async importSkinnedMesh(config: MeshConfig) {
        const result = await this._loadInternal<SkinnedMesh>(config);
        let mesh: Object3D[] = result.meshes;
        const { animations } = result;
        const animMap = new Map<string, AnimationClip>();
        for (const animationName of config.selectAnimationList) {
            const targetClip = animations.find(anim => anim.name.includes(animationName));
            if (targetClip) {
                animMap.set(animationName, targetClip);
            }
        }
        return {
            object: mesh[0],
            animationMap: animMap
        };
    }
    
    importSimpleMesh(config: MeshConfig, mergeIntoOne?: false): Promise<Mesh[]>;
    importSimpleMesh(config: MeshConfig, mergeIntoOne?: true): Promise<Mesh>;
    async importSimpleMesh(config: MeshConfig, mergeIntoOne = true) {
        const data = await this._loadInternal<Mesh>(config);
        if (mergeIntoOne) {
            const singleGeometry = BufferGeometryUtils.mergeBufferGeometries(data.meshes.map(mesh => mesh.geometry as BufferGeometry));
            const mesh = new Mesh(singleGeometry, new MeshBasicMaterial({ color: 0xffffff }));
            mesh.castShadow = true;
            return mesh;
        } else {
            return data.meshes;
        }
    }

    private async _loadInternal<T extends Mesh>(config: MeshConfig) {
        const loadUrl = config.loadUrl;
        const root = await this.getSceneFromFile(loadUrl);
        const isSkinnedMesh = config.isSkinned;
        if (!isSkinnedMesh) {
            return {
                meshes: getObject3DMeshes(root.scene) as T[],
                animations: root.animations
            };

        } else {
            return {
                meshes: root.scenes as T[],
                animations: root.animations
            }
        }
    }

    private getSceneFromFile(loadUrl: string): any {
        let loader;
        let isSceneFile = false;
        if (loadUrl.includes('.obj')) {
            throw new Error('Using .obj files deprecated.');
        } else if (loadUrl.includes('.fbx')) {
            loader = new FBXLoader();
            isSceneFile = true;
        } else if (loadUrl.includes('.gltf') || loadUrl.includes('.glb')) {
            isSceneFile = true;
            loader = this.getGLTFLoader(loader);
        }
        return new Promise<Object3D>((resolve, reject) => {
            loader.load(loadUrl, root => {
                resolve(root);
            });
        })
    };

    private getGLTFLoader(loader: any) {
        loader = new GLTFLoader();
        return loader;
    }

    private getObjLoader() {
        return new OBJLoader();
    }
}