import { Injectable, Inject, Injector } from 'injection-js';
import { RenderingPipelineService } from './render/RenderingPipeline.service';
import { TilesFactory } from './game/map/tiles/Tiles.factory';
import { MapService } from './game/map/Map.service';
import { UIManager } from './ui/UIManager.service';
import { PlayerService, PlayerActionType } from './game/player/Player.service';
import { WalkActionHandler } from './game/player/action/WalkService';
import { AVAILABLE_TILES } from './game/map/Map.utils';
import { ScautActionHandler } from './game/player/action/ScoutActionHandler';
import { MeshConfig } from './meshes/MeshConfig.interface';
import { EnemyService } from './game/enemy/Enemy.service';
import { EnemyType } from './game/enemy/Enemy.model';
import { linkDefaultComponent } from './DefaultComponents.utils';
import { Scenario } from './scenario/Scenario.model';
import { AssetsService } from './game-utils/assets/Assets.service';
import { GameObjectProducer } from './game/game-object/GameObjectProducer.model';
import { Tile } from './game/map/tiles/Tile';
import { WorldService } from './game/game-object/world/World.service';
import { GameStateService } from './state/GameState.service';
import { StateWatcherService } from './state/watchers/StateWatcher.service';
import { DicesService } from './game/dice/Dice.service';
import { VATSHitType } from './game/dice/DieResult.interface';
import { getVATSHitByType } from './game/dice/VATSHit.model';
import { GameActiveParser } from './game/active/parsers/ActiveParser.service';
import { factoryWeaponFromGameData } from './game/active/Weapon.model';
import { GameInventoryService } from './game/active/GameInventory.service';
import { GameStateRepository } from './state/GameStateRepository.model';
import { ActiveType } from './game/active/GameActive.model';
import { GameInventoryItem } from './game/active/GameInventoryItem.model';
import { registerMultipleGameFunctions } from './game-logic/game-state-machine/GameTermResolver.service';
import { StdGameFunctionsLib } from './game-logic/game-state-machine/GameTermsLib.utils';
import { UIText } from './ui/texts/UIText.service';
import { GameEntitiesManager } from './game-logic/GameEntityManager.service';
import { injectorGet } from './utils/Common.utils';
import { getGameSettings } from './settings/SettingsGeneral';
import { ObservableStore } from './state/observables/ObservableStore.model';
import { getLightsForScene } from './scene/Light.utils';
import { BehaviorSubject, Subject } from 'rxjs';
import GameObservableStore from './GameObservableStore';
import { ArrayUtils } from './utils/Array.utils';
import { SceneComposer } from './scene/SceneComposer';

@Injectable()
export class ApplicationEntry {
    constructor(
        @Inject(RenderingPipelineService) private renderingPipelineService: RenderingPipelineService,
        @Inject(TilesFactory) private tiles: TilesFactory,
        @Inject(MapService) private map: MapService,
        @Inject(UIManager) private uiManager: UIManager,
        @Inject(PlayerService) private playerService: PlayerService,
        @Inject(EnemyService) private enemies: EnemyService,
        @Inject(Scenario) private scenario: Scenario,
        @Inject(AssetsService) private assets: AssetsService,
        @Inject(WorldService) private world: WorldService,
        @Inject(GameStateService) private state: GameStateService,
        @Inject(StateWatcherService) private watchers: StateWatcherService,
        @Inject(DicesService) private dices: DicesService,
        @Inject(GameInventoryService) private inventory: GameInventoryService,
        @Inject(GameStateRepository) private repository: GameStateRepository,
        @Inject(GameEntitiesManager) private entities: GameEntitiesManager,
        @Inject(Injector) private injector: Injector,
        @Inject(UIText) private textes: UIText,
        @Inject(SceneComposer) private sceneComposer: SceneComposer
    ) {

    }

    async main() {
        this.watchers.startWatch();
        const entities = await this.inventory.initializeItems();
        entities.forEach(entity => this.entities.register(entity))
        const defines = this.scenario.preloadDependency(Object.assign({}, this.enemies.assetsDependency, this.tiles.assetsDependency, this.dices.assetsDependency));
        this.assets.defineAssets(defines);
        this.initPlayerActions();
        await this.assets.loadDefinedAssets();
        this.dices.create(3);
        this.world.createTable();
        await this.state.initState();
        registerMultipleGameFunctions(StdGameFunctionsLib)(this.injector);
        this.enemies.registerEnemyType({
            key: 'feral_ghoul',
            type: EnemyType.INSECTS,
            tokenTextureName: 'feral_ghoul_token',
            enemyImageSrc: '/text/enemies/feral_ghoul_image.png',
            level: 2,
            abilities: [],
            weakBodyParts: [VATSHitType.Head, VATSHitType.Body, VATSHitType.Legs].map(type => getVATSHitByType(type)),
            name: 'Дикий гуль'
        })
        this.renderingPipelineService.start();
        const lights = getLightsForScene(GameObservableStore);
        lights.subscribe(this.sceneComposer.addArrayByKey('worldLights'))
        await this.textes.loadTextJSON('/txt/ua.json');
        this.testBed();
        this.uiManager.render(linkDefaultComponent)
    }

    private initPlayerActions() {
        this.playerService.setActionHandler(PlayerActionType.Walk, new WalkActionHandler());
        this.playerService.setActionHandler(PlayerActionType.Scaut, new ScautActionHandler());
    }

    private testBed() {
        const inventory = this.repository.playerInventory(this.playerService.player.id);
        if(inventory.length === 0) {
            this.inventory.drawRandom(ActiveType.Loot).resolve(this.playerService.player.id);
        }
    }
}