import { of, pipe } from "rxjs";
import { SettingsQuality } from "../settings/SettingsGeneral";
import { IObservableStore, ObservableStore } from "../state/observables/ObservableStore.model";
import { compose } from "../utils/Functions.utils";
import { match, pickKey } from "../utils/Common.utils";
import { map, switchMap } from "rxjs/operators";
import { SpotLight, Vector3, DirectionalLight, Light, HemisphereLight, AmbientLight } from "three";
import { MathUtils } from "../utils/Math.utils";
import { Player } from "../game/player/Player.model";
import { getLightSettings } from "../state/observables/ObservableAccessors.utils";

export const getLightsForScene = (store: IObservableStore) => compose(
    getLightSettings,
    pipe(
        switchMap(match([
            [SettingsQuality.LOW, () => of(getEnvLights(2))],
            [SettingsQuality.MEDIUM, () => getDirectionalLightForScene(store)],
            [SettingsQuality.HIGH, () => getSpotLightForScene()]
        ], () => getDirectionalLightForScene(store)))
    )
)(store);

const getEnvLights = (intensivity: number) => {
    const envLight = new HemisphereLight(0xff8fff, 0xffffff, 0.5 * intensivity);
    envLight.color.setHSL(0.6, 1, 0.95);
    envLight.groundColor.setHSL(0.095, 1, 0.85);
    envLight.position.set(0, 200, 100);
    return [envLight, new AmbientLight(0xffffff, .015 * intensivity)];
}

const getSpotLightForScene = () => {
    return of([
        new Vector3(100, 200, 1100),
        new Vector3(1000, 3000, 1100),
    ].flatMap<Light>(position => {
        const dirLight = new SpotLight(0xa0a0a0, .6, 3500, MathUtils.toRad(135), .3);

        dirLight.color.setHSL(.07, .65, 0.95);
        dirLight.position.set(position.x, position.y, position.z);
        dirLight.castShadow = true;
        const lightTarget = dirLight.target;
        lightTarget.position.set(position.x, position.y, 0);
        lightTarget.updateMatrixWorld();

        dirLight.shadow.camera.far = 3000;
        dirLight.shadow.camera.near = 1;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        dirLight.shadow.radius = 20;
        dirLight.shadow.bias = -0.000001;
        return [dirLight, lightTarget as any];
    }).concat(...getEnvLights(1)));
}

const getDirectionalLightForScene = compose(
    ObservableStore.get<Player>('currentPlayer'),
    player$ => player$.pipe(
        map(pickKey('character')),
        map(pickKey('object3d')),
        map(target => {
            return [
                new Vector3(100, 200, 1100),
                new Vector3(1000, 3000, 1100)
            ].flatMap(position => {
                const dirLight = new DirectionalLight(0xffffff, .8);

                dirLight.color.setHSL(.00, 0, 0.55);
                dirLight.position.set(position.x, position.y, position.z);

                dirLight.target = target;
                return [dirLight] as Light[];
            }).concat(...getEnvLights(.7))
        })
    )
)
