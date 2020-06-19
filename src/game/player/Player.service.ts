import { Inject, Injectable, Injector } from "injection-js";
import { MeshConfig } from "../../meshes/MeshConfig.interface";
import { CharacterFactory } from "../game-object/characters/Character.factory";
import { GameObjectManager } from "../game-object/GameObjectsManager.service";
import { InteractorsService } from "../interactors/Interactors.service";
import { PlayerMiniatureInteractorToken } from "../interactors/InteractorsTokens.utils";
import { PlayerMiniatureInteractor } from "../interactors/PlayerMiniatureIteractor.service";
import { TileSector } from "../map/tiles/TileSector.model";
import { MapService } from "../map/Map.service";
import { Character } from "../game-object/characters/Character";
import { Vector3 } from "three";
import { PlayerActionHandler } from "./action/PlayerAction.model";
import { SelectionService } from "../game-object/Selection.service";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";
import { Player } from "./Player.model";
import { Subject } from "rxjs";
import { PhasesService } from "../phases/Phases.service";
import { PlayerShadowReceiverRecalcStrategy } from "../game-object/shadow-receiver-recalc-strategy/impl/PlayerShadowReceiverRecalcStrategy.model";
import { MapSector } from "../map/MapSector.model";
import { GroupedActionHandlers } from "./action/GroupedActionHandler.model";
import { GameStateService } from "../../state/GameState.service";
import { PlayerState } from "../../state/GameState.interface";
import { StateLensFactory } from "../../utils/lens/StateLens.factory";

export enum PlayerActionType {
    Walk,
    Scaut,
    Fight,
    Quest,
    Encount,
    Sleep
}

const PlayerMoveSpeed = 800; //units per second

@Injectable()
export class PlayerService {

    playerCharacter: Character;

    player: Player = new Player('self');

    private actionHandlers = new Map<PlayerActionType, PlayerActionHandler>();

    private moveAnimationCycleId = null;

    constructor(
        @Inject(CharacterFactory) private characters: CharacterFactory,
        @Inject(GameObjectManager) private gameObjectManager: GameObjectManager,
        @Inject(SelectionService) private selection: SelectionService,
        @Inject(InteractorsService) private interactors: InteractorsService,
        @Inject(MapService) private map: MapService,
        @Inject(Injector) private injector: Injector,
        @Inject(GameStateService) private state: GameStateService
    ) {

    }

    async spawnPlayer(assetName: string, player?: PlayerState) {

        const character = await this.characters.create(assetName);
        this.playerCharacter = character;
        if (player) {
            this.player = this.fromPlayerState(player);
        }
        this.player.character = character;
        this.gameObjectManager.addObject(character);
        this.interactors.register(PlayerMiniatureInteractorToken, new PlayerMiniatureInteractor(character));
        const initialSector = this.map.getInitialSector();
        this.selection.makeSelectable(character);
        if (!player.sector) {
            this.state.patchChanges([state => StateLensFactory.playerSector.set(state, initialSector.toGameState())])
        }
        return this.player;
    }

    putPlayerAt(sector: TileSector) {
        this.setPlayerSector(sector);
        const newPlayerPosition = this.map.getWorldCenterCoords(MapSector.fromSector(sector));
        this.playerCharacter.object3d.position.set(newPlayerPosition.x, newPlayerPosition.y, 12);
        this.playerCharacter.object3d.updateMatrixWorld();
    }


    movePlayerTo(sector: TileSector) {
        this.setPlayerSector(sector);
        const targetPosition = this.map.getWorldCenterCoords(MapSector.fromSector(sector));
        targetPosition.set(targetPosition.x, targetPosition.y, 15)
        this.playerCharacter.object3d.translateZ(90);
        const originalPosition = this.playerCharacter.object3d.position.clone();
        const requiredTime = targetPosition.distanceTo(originalPosition) / PlayerMoveSpeed;
        this.playerCharacter.pushAnimation(passedMs => {
            const passedSeconds = passedMs / 1000;
            const interpolationParam = passedSeconds / requiredTime;
            const currentPosition = originalPosition.clone().lerp(targetPosition, interpolationParam);
            this.playerCharacter.object3d.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
            this.playerCharacter.object3d.lookAt(targetPosition.x, targetPosition.y, this.playerCharacter.height * 2);
        }, requiredTime * 1000)
        if (this.moveAnimationCycleId) {
            cancelRequestAnimationFrames(this.moveAnimationCycleId)
        }
    }

    performAction(actionType: PlayerActionType) {
        const actionHandler = this.actionHandlers.get(actionType);
        if (actionHandler) {
            actionHandler.startAction();
        }
    }

    performMultipleActions(actionTypes: PlayerActionType[]) {
        const actions = actionTypes.map(type => this.actionHandlers.get(type));
        const groupHandler = new GroupedActionHandlers(actions);
        groupHandler.startAction();
    }

    getAvailableListOfActions(): PlayerActionType[] {
        return [
            PlayerActionType.Walk,
            PlayerActionType.Scaut,
            PlayerActionType.Fight,
            PlayerActionType.Quest,
            PlayerActionType.Encount,
            PlayerActionType.Sleep
        ]
    }

    setActionHandler(type: PlayerActionType, handler: PlayerActionHandler) {
        handler.setInjector(this.injector);
        this.actionHandlers.set(type, handler);
    }

    fromPlayerState(playerState: PlayerState) {
        if (this.player && this.player.id === playerState.id) {
            return this.player;
        } else {
            const player = new Player(playerState.id);
            player.sector = this.map.getSectorBySectorState(playerState.sector);
            return player;
        }
    }

    private setPlayerSector(sector: TileSector) {
        this.player.sector = sector;
        this.gameObjectManager.recalculateShadowReceivers(new PlayerShadowReceiverRecalcStrategy(this.player));
    }
}