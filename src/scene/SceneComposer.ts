import { Scene, Object3D } from "three";


export class SceneComposer {
    readonly scene = new Scene();

    private singeObjectLink = new Map<string, Object3D>();
    private multipleObjectsLink = new Map<string, Object3D[]>();

    addByKey = (key: string) => (object: Object3D) => {
        const previousObject = this.singeObjectLink.get(key);
        if(previousObject) {
            this.scene.remove(previousObject);
        }
        this.singeObjectLink.set(key, object);
        this.scene.add(object);
    }

    addArrayByKey = (key: string) => (objects: Object3D[]) => {
        const previousObject = this.multipleObjectsLink.get(key);
        if(previousObject) {
            this.scene.remove(...previousObject);
        }
        this.multipleObjectsLink.set(key, objects);
        this.scene.add(...objects);
    }
}