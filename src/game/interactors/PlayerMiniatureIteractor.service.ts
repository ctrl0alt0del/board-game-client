import { GameObject } from "../game-object/GameObject.model";
import { GameObjectInteractor } from "./GameObjectInteractor.model";
import { UIManager, PLAYER_ACTION_MENU_ITEM } from "../../ui/UIManager.service";
import { Vector2, Mesh, Vector3 } from "three";
import { CameraController } from "../../camera/CameraController";
import { PlayerService, PlayerActionType } from "../player/Player.service";
import { PLAYER_ACTION_MENU_ID } from "../../ui/Constants";
import { Character } from "../game-object/characters/Character";
import { RenderingPipelineService } from "../../render/RenderingPipeline.service";


export class PlayerMiniatureInteractor extends GameObjectInteractor<Character> {
    hover() {
        const pipeline = this.injector.get(RenderingPipelineService);
        pipeline.addOutlineObjects([this.gameObject.object3d]);
    }
    unhover(){
        
        const pipeline = this.injector.get(RenderingPipelineService);
        pipeline.removeOutlineObjects([this.gameObject.object3d]);
    }
    touch() {
        const playerService = this.injector.get(PlayerService);
        const availableActions = playerService.getAvailableListOfActions();
        const actionList = [];
        if(availableActions.includes(PlayerActionType.Walk)) {
            actionList.push(PlayerActionType.Walk)
        }
        if(availableActions.includes(PlayerActionType.Scaut)) {
            actionList.push(PlayerActionType.Scaut);
        }
        playerService.performMultipleActions(actionList);
    }
}