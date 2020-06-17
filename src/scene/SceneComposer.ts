import { Light, HemisphereLight, Scene, DirectionalLight, DirectionalLightHelper, PointLight, AmbientLight, Vector3, Object3D, SpotLight } from "three";
import { MathUtils } from "../utils/Math.utils";

const DirectionalLightsPositionArray = [
    new Vector3(100, 200, 1100),
    new Vector3(1000, 3000, 1100),
]

export class SceneComposer {

    private lights = new Map<string, Light>()
    readonly scene = new Scene();

    setupLights() {
        this.createEnviromentLight();
        for (let i = 0; i < DirectionalLightsPositionArray.length; i++) {
            const directionalLight = this.createSun(DirectionalLightsPositionArray[i]);
            this.scene.add(directionalLight);
            this.lights.set('directLight'+i, directionalLight)
        }
        this.scene.add(new AmbientLight(0xffffff, .015));
    }

    private createEnviromentLight() {
        const envLight = new HemisphereLight(0xff8fff, 0xffffff, 0.5);
        envLight.color.setHSL(0.6, 1, 0.95);
        envLight.groundColor.setHSL(0.095, 1, 0.85);
        envLight.position.set(0, 200, 100);
        this.scene.add(envLight);
        this.lights.set('envLight', envLight);
    }

    private createSun(position: Vector3) {
        const dirLight = new SpotLight(0xa0a0a0, .6, 3500, MathUtils.toRad(135), .3);

        dirLight.color.setHSL(.07, .65, 0.95);
        dirLight.position.set(position.x, position.y, position.z);
        dirLight.castShadow = true;
        const lightTarget = dirLight.target;
        this.scene.add(lightTarget);
        lightTarget.position.set(position.x, position.y, 0);
        lightTarget.updateMatrixWorld();

        dirLight.shadow.camera.far = 3000;
        dirLight.shadow.camera.near = 1;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        dirLight.shadow.radius = 20;
        dirLight.shadow.bias = -0.000001;
        return dirLight;
    }
}