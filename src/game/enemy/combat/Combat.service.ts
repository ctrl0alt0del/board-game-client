import { Injectable, Inject } from "injection-js";
import { Enemy } from "../Enemy.model";
import { PlayerService } from "../../player/Player.service";
import { Combat } from "./Combat.model";
import { CameraController } from "../../../camera/CameraController";
import { Vector3 } from "three";
import { TILE_SIZE } from "../../../common/InjectionTokens.utils";
import { PhasesService } from "../../phases/Phases.service";
import { CombatPhase } from "../../phases/phase-impl/CombatPhase.model";
import { GameStateService } from '../../../state/GameState.service';
import { getCombatBoundingBox } from "./Combat.utils";

@Injectable()
export class CombatService {

    constructor(
        @Inject(PlayerService) private players: PlayerService,
        @Inject(CameraController) private cameraController: CameraController,
        @Inject(PhasesService) private phases: PhasesService,
        @Inject(TILE_SIZE) private tileSize: number,
        @Inject(GameStateService) private state: GameStateService
    ) {

    }
    //TODO: Add player to start with (now it only starts with current player)
    startCombat(enemy: Enemy) {
        const player = this.players.player;
        const combat = new Combat(enemy, player);
        const phase = new CombatPhase(combat);
        this.phases.initiatePhaseStart(phase);

    }

    async adjustCameraForCombat(combat: Combat) {
        const { enemy, player: { character: playerCharacter } } = combat;
        await enemy.waitAnimationQueue();
        await playerCharacter.waitAnimationQueue();
        const enemyPos = enemy.attachedPosition;
        const playerPos = playerCharacter.object3d.position;
        let dir = new Vector3().subVectors(enemyPos, playerPos);
        if (dir.length() < 30) {
            dir = new Vector3(0, 0, 0).sub(playerPos).normalize().multiplyScalar(this.tileSize);
        }
        const newEnemyPos = new Vector3().addVectors(enemyPos, dir.clone().multiplyScalar(-.25));
        const newPlayerPos = new Vector3().addVectors(enemyPos, dir.clone().multiplyScalar(.75));
        playerCharacter.object3d.position.set(newPlayerPos.x, newPlayerPos.y, playerCharacter.object3d.position.z);
        enemy.tokenMesh.position.set(newEnemyPos.x, newEnemyPos.y, enemy.tokenMesh.position.z);
        const commonBox = getCombatBoundingBox(combat);
        this.cameraController.fitCameraToBox(commonBox);
    }
}