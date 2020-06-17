import { Injectable, Inject } from "injection-js";
import { GameObjectManager } from "./GameObjectsManager.service";
import { CameraController } from "../../camera/CameraController";
import { Vector2, Vector3 } from "three";
import { getSelectableStrategy } from "./selectable/Selectable.decorator";
import { RenderingPipelineService } from "../../render/RenderingPipeline.service";
import { GameObject } from "./GameObject.model";

export interface HoverData {
    object: GameObject,
    point: Vector3
}

@Injectable()
export class SelectionService {

    private selectableObjets: GameObject[] = [];

    constructor(
        @Inject(CameraController) private cameraService: CameraController,
        @Inject(RenderingPipelineService) private rendering: RenderingPipelineService
    ) {

    }

    makeSelectable(gameObject: GameObject) {
        this.selectableObjets.push(gameObject)
    }

    unmakeSelectable(gameObject: GameObject) {
        this.selectableObjets = this.selectableObjets.filter(obj => obj !== gameObject);
    }

    getObjectFromScreenCoords(vector2: Vector2) {
        const worldVector = this.cameraService.screenToWorld(vector2);
        const ray = this.cameraService.getRay(worldVector);
        let point: Vector3;
        const hovered = this.selectableObjets.find(obj => {
            const strategy = getSelectableStrategy(obj);
            if (strategy) {
                point = strategy.isHovered(ray);
                return !!point;
            }
            else {
                return false;
            }
        });
        return hovered ? {
            object: hovered,
            point
        } : null;
    }
}