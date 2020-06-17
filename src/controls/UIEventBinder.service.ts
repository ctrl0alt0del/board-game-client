import { Injectable, Inject } from "injection-js";
import { UIEventManager } from "./UIEventManager.service";
import { Vector2 } from "three";
import { GameObjectManager } from "../game/game-object/GameObjectsManager.service";
import { SelectionService } from "../game/game-object/Selection.service";
import { InteractorsService } from "../game/interactors/Interactors.service";
import { PlayerActionType, PlayerService } from "../game/player/Player.service";
import { UIManager } from "../ui/UIManager.service";
import { PLAYER_ACTION_MENU_ID } from "../ui/Constants";
import { UIComponentResolver } from "../ui/UIComponentResolver.service";
import { GameObjectInteractor } from "../game/interactors/GameObjectInteractor.model";
import { KeydownCode } from "./Keycodes.constants";
import { CameraController } from "../camera/CameraController";

const CameraVelocity = 1060;

@Injectable()
export class UIEventBinder {

    private previouslyHoveredInteractor: GameObjectInteractor;

    constructor(
        @Inject(UIEventManager) private uiEvents: UIEventManager,
        @Inject(SelectionService) private selection: SelectionService,
        @Inject(InteractorsService) private interactors: InteractorsService,
        @Inject(PlayerService) private playerService: PlayerService,
        @Inject(UIManager) private uiManager: UIManager,
        @Inject(UIComponentResolver) private uiResolver: UIComponentResolver,
        @Inject(CameraController) private cameraController: CameraController
    ) {
        this.setupEventsListeners();
    }

    onPlayerActionSelect(actionType: PlayerActionType) {
        this.uiManager.removeFloatMenu(PLAYER_ACTION_MENU_ID)
        this.playerService.performAction(actionType);
    }

    private setupEventsListeners() {
        this.uiEvents.mouseMove.subscribe((event) => this.onMouseMove(event));
        this.uiEvents.mouseDown.subscribe(event => this.onMouseDown(event));
        this.uiEvents.keyDown.subscribe(event => this.onKeyDown(event));
        this.uiEvents.keyUp.subscribe(event => this.onKeyUp(event));
        this.uiEvents.mouseWheel.subscribe(event => this.onMouseWheel);
    }

    private onMouseWheel(event: WheelEvent) {

    }

    private onKeyDown(event: KeyboardEvent) {
        const keyCode: KeydownCode = event.keyCode;
        switch(keyCode) {
            case KeydownCode.D: {
                return this.cameraController.setCameraVelocity(new Vector2(0, CameraVelocity));
            }
            case KeydownCode.A: {
                return this.cameraController.setCameraVelocity(new Vector2(0, -CameraVelocity));
            }
            case KeydownCode.W: {
                return this.cameraController.setCameraVelocity(new Vector2(-CameraVelocity, 0));
            }
            case KeydownCode.S:{
                return this.cameraController.setCameraVelocity(new Vector2(CameraVelocity, 0))
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        const keyCode: KeydownCode = event.keyCode;
        switch(keyCode) {
            case KeydownCode.D: 
            case KeydownCode.A: 
            case KeydownCode.W: 
            case KeydownCode.S:{
                return this.cameraController.setCameraVelocity(new Vector2(0, 0))
            }
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isClickedOnCanvas(event)) {
            return;
        }
        const vector2 = this.mouseEventToVector2(event);
        const result = this.selection.getObjectFromScreenCoords(vector2);
        if (result) {
            const { object: gameObject, point } = result;
            const interactor = this.interactors.getInteractorForGameObject(gameObject);
            if (interactor) {
                if (this.previouslyHoveredInteractor && this.previouslyHoveredInteractor !== interactor) {
                    this.previouslyHoveredInteractor.unhover();
                }
                this.previouslyHoveredInteractor = interactor;

                interactor.hover(point);
                return;
            }
        }

        if (this.previouslyHoveredInteractor) {
            this.previouslyHoveredInteractor.unhover();
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.isClickedOnCanvas(event)) {
            return;
        }
        const vector = this.mouseEventToVector2(event);
        const result = this.selection.getObjectFromScreenCoords(vector);
        if (result) {
            const { object: gameObject, point } = result;
            const interactor = this.interactors.getInteractorForGameObject(gameObject);
            if (interactor) {
                interactor.touch(point);
            }
        }
    }

    private isClickedOnCanvas(event: MouseEvent) {
        const eventTarget = event.target as HTMLElement;
        return eventTarget.id === 'ui-container' || !eventTarget.dataset.click;
    }

    private mouseEventToVector2(event: MouseEvent) {
        const { clientX, clientY } = event;
        const vector2 = new Vector2(clientX, clientY);
        return vector2;
    }
}