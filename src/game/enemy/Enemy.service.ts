import { Injectable, Inject } from "injection-js";
import { TileSector } from "../map/tiles/TileSector.model";
import { c_NONE } from "../../language/LanguageContstants.utils";
import { Enemy, EnemyType } from "./Enemy.model";
import { MapService } from "../map/Map.service";
import { GameObjectManager } from "../game-object/GameObjectsManager.service";
import { EnemyConfig } from "./EnemyConfig.interface";
import { Mesh, Texture, MeshBasicMaterial, CanvasTexture, MeshPhysicalMaterial } from "three";
import { getTokenBackTextureUrlByType } from "./Enemy.utils";
import { CombatService } from "./combat/Combat.service";
import { PhasesService } from "../phases/Phases.service";
import { PhaseType } from "../phases/PhaseType.enum";
import { WalkPhaseData, ScoutPhaseData } from "../phases/phase-impl/PhaseDataImpl.interface";
import { MapSector } from "../map/MapSector.model";
import { AssetsService } from "../../game-utils/assets/Assets.service";
import { AssetsDefineObject, AssetsEntryType } from "../../game-utils/assets/AssetsService.interface";
import { GameStateService } from "../../state/GameState.service";
import { Tile } from "../map/tiles/Tile";
import { createSpawnEnemyPhase } from "../phases/phase-impl/Phases.utils";
import { GameEntity } from "../../game-logic/GameEntity.model";
import { v4 } from "uuid";
import { GameEffectLib } from "../../game-logic/effects/GameEffectLib.utils";
import { GameEntitiesManager } from "../../game-logic/GameEntityManager.service";

@Injectable()
export class EnemyService {
    private availableEnemies: Enemy[] = [];

    constructor(
        @Inject(MapService) private map: MapService,
        @Inject(GameObjectManager) private gameObjectManager: GameObjectManager,
        @Inject(CombatService) private combats: CombatService,
        @Inject(PhasesService) private phasesService: PhasesService,
        @Inject(AssetsService) private assets: AssetsService,
        @Inject(GameEntitiesManager) private entities: GameEntitiesManager
    ) {
        this.phasesService.addOnPhaseEndHandler(phaseData => {
            if (phaseData.name === PhaseType.Scout) {
                const { tile } = phaseData as ScoutPhaseData;
                return this.spawnAvailableEnemiesForTile(tile);
            }
        })
    }

    get assetsDependency(): AssetsDefineObject {
        const object = {
            enemy_token: {
                type: AssetsEntryType.Mesh,
                config: { loadUrl: 'obj/enemy_token.glb' }
            }
        } as AssetsDefineObject;
        for (const type in EnemyType) {
            const textureUrl = getTokenBackTextureUrlByType(EnemyType[type]);
            if (textureUrl) {
                Object.assign(object, {
                    [`enemy_type_${type}`]: {
                        type: AssetsEntryType.Texture,
                        config: { loadUrl: textureUrl }
                    }
                })
            }
        }
        return object;
    }

    getEnemyForSector(tileSector: TileSector) {
        const enemyType = tileSector.enemyType;
        if (enemyType !== c_NONE) {
            const enemyPool = this.availableEnemies.filter(enemy => enemyType === enemy.config.type);
            return enemyPool[0];
        }
    }

    spawnEnemyAtSector(enemyKey: string, sector: TileSector, spawnAsActive = true) {
        const targetEnemy = this.getEnemyByKey(enemyKey);
        if (targetEnemy) {
            targetEnemy.isActive = spawnAsActive;
            targetEnemy.attachedPosition = this.map.getWorldCenterCoords(MapSector.fromSector(sector));
            this.gameObjectManager.addObject(targetEnemy);
            targetEnemy.currentSector = sector;
            this.registerPhaseSubscribers(targetEnemy);
        }
    }

    getEnemyByKey(enemyKey: string) {
        return this.availableEnemies.find(enemy => enemy.config.key === enemyKey);
    }

    kill(enemy: Enemy) {
        for (const sub of enemy.phaseSubscribers) {
            sub.unsubscribe();
        }
    }

    async registerEnemyType(config: EnemyConfig) {
        const { tokenTextureName } = config;
        const faceTexture = await this.assets.get<Texture>(tokenTextureName);
        const { geometry } = await this.assets.get<Mesh>('enemy_token');
        const backTexture = await this.assets.get<Texture>(`enemy_type_${config.type}`);
        const texture = this.compileTexture(faceTexture, backTexture);
        const tileMesh = new Mesh(geometry, new MeshPhysicalMaterial({
            color: 0xffffff,
            reflectivity: 0,
            map: texture
        }));
        const enemy = new Enemy(config);
        enemy.entity = this.buildGameEntity(config); 
        this.entities.register(enemy.entity);
        enemy.tokenMesh = tileMesh;
        this.availableEnemies.push(enemy);
    }

    private buildGameEntity(config: EnemyConfig): GameEntity {
        return new GameEntity(
            config.key,
            [GameEffectLib.getEnemyLevelGameEffect(config.level),
            GameEffectLib.getArmorEffect(1)]
        )
    }

    private registerPhaseSubscribers(selectedEnemy: Enemy) {
        const sub = this.phasesService.addOnPhaseEndHandler(phaseData => {
            if (phaseData.name === PhaseType.Walk) {
                const walkData = phaseData as WalkPhaseData;
                if (walkData.destinationSector === selectedEnemy.currentSector) {
                    this.combats.startCombat(selectedEnemy);
                }
            }
        });
        selectedEnemy.phaseSubscribers.push(sub);
    }

    private compileTexture(faceTexture: Texture, backTexture: Texture) {
        const { width: faceTextureWidth, height: faceTextureHeight } = faceTexture.image;
        const { height: backTextureHeight, width: backTextureWidth } = backTexture.image;
        const faceTextureOffestX = .29, faceTextureOffsetY = .008, backTextureOffsetX = 0.006, backTextureOffsetY = 0.538, faceTextureEndOffsetY = 0.629, faceScale = .70, backScale = .52;
        const fullTextureWidth = faceTextureWidth / (1 - faceTextureOffestX);
        const fullTextureHeight = faceTextureHeight / (faceTextureEndOffsetY - faceTextureOffsetY);
        const canvas = document.createElement('canvas');
        canvas.width = fullTextureWidth;
        canvas.height = fullTextureHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(faceTexture.image, faceTextureOffestX * fullTextureWidth, faceTextureOffsetY * fullTextureHeight - 0.065 * faceTextureHeight, fullTextureWidth * faceScale, fullTextureHeight * (faceScale + .006));
        ctx.drawImage(backTexture.image, backTextureOffsetX * fullTextureWidth, backTextureOffsetY * fullTextureHeight - 0.065 * backTextureHeight, fullTextureWidth * backScale, fullTextureHeight * (backScale + .006));
        const outputTexture = new CanvasTexture(canvas);
        outputTexture.flipY = false;
        outputTexture.anisotropy = 16; //TODO: settings
        return outputTexture;
    }

    private async spawnAvailableEnemiesForTile(tile: Tile) {
        for (const sector of tile.sectors) {
            const enemyToSpawn = this.getEnemyForSector(sector);
            if (enemyToSpawn) {
                enemyToSpawn.isActive = true;
                enemyToSpawn.currentSector = sector;
                await this.phasesService.initiatePhaseStart(createSpawnEnemyPhase(enemyToSpawn, sector));
            }
        }
    }

}