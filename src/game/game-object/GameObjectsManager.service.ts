import { Injectable, Inject } from "injection-js";
import { GameObject } from "./GameObject.model";
import { SceneComposer } from "../../scene/SceneComposer";
import { ShadowReceiverRecalcStrategy } from "./shadow-receiver-recalc-strategy/ShadowReceiverRecalculationStrategy.model";

@Injectable()
export class GameObjectManager {
    private objects: GameObject[] = [];

    constructor(
        @Inject(SceneComposer) private sceneComposer: SceneComposer
    ) {
    }

    addObject(object: GameObject) {
        this.objects.push(object);
        this.sceneComposer.scene.add(object.object3d);
        object.onAddedToScene.next();
    }

    getOne(predice: (object: GameObject) => boolean) {
        return this.objects.find(predice);
    }

    recalculateShadowReceivers(strategy: ShadowReceiverRecalcStrategy) {
        for(const obj of this.objects) {
            const strategyResult = strategy.shouldReceiveShadow(obj);
            obj.setReceiveShadowState(strategyResult);
        }
    }
}