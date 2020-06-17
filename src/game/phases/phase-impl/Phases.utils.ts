import { createSimplePhase } from "../SimpleGamePhase.model";
import { SpawnEnemyPhaseData } from "./PhaseDataImpl.interface";
import { PhaseType } from "../PhaseType.enum";
import { Enemy } from "../../enemy/Enemy.model";
import { GameStateUpdateUtils } from "../../../state/GameStateUpdater.utils";
import { TileSector } from "../../map/tiles/TileSector.model";
import { Injector } from "injection-js";
import { GameStateService } from "../../../state/GameState.service";
import { StateLensFactory } from "../../../utils/lens/StateLens.factory";

export const createSpawnEnemyPhase = (enemy: Enemy, sector: TileSector) => {
    return createSimplePhase<SpawnEnemyPhaseData>({
        name: PhaseType.EnemySpawn,
        enemy: enemy,
        sector: sector,
        spawnAsActive: true
    }, async (injector: Injector) => {
        injector.get(GameStateService).patchChanges([
            GameStateUpdateUtils.spawnEnemy(enemy),
            state => StateLensFactory.entities.add(state, enemy.entity.toGameState())
        ]);
    });
}