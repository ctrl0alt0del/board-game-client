import { ReflectiveInjector } from 'injection-js';
import { ApplicationEntry } from './ApplicationEntry';
import { RenderingPipelineService } from './render/RenderingPipeline.service';
import { MeshFactory } from './meshes/MeshFactory';
import { CameraController } from './camera/CameraController';
import { SceneComposer } from './scene/SceneComposer';
import { TilesFactory } from './game/map/tiles/Tiles.factory';
import { TexturesFactory } from './meshes/textures/Textures.factory';
import { TilePositionManager } from './game/map/TilePositionManager/TilePositionManager.interface';
import { AxialTilePositionManager } from './game/map/TilePositionManager/impl/AxialTilePositionManager.model';
import { MapService } from './game/map/Map.service';
import { CharacterFactory } from './game/game-object/characters/Character.factory';
import { TILE_SIZE } from './common/InjectionTokens.utils';
import { UIEventBinder } from './controls/UIEventBinder.service';
import { UIEventManager } from './controls/UIEventManager.service';
import { GameObjectManager } from './game/game-object/GameObjectsManager.service';
import { SelectionService } from './game/game-object/Selection.service';
import { InteractorsService } from './game/interactors/Interactors.service';
import { UIManager } from './ui/UIManager.service';
import { WorldService } from './game/game-object/world/World.service';
import { PlayerService } from './game/player/Player.service';
import { UIComponentResolver, UIEventHandler } from './ui/UIComponentResolver.service';
import { TileModelParser } from './parsers/TileModelParser.service';
import { EnemyService } from './game/enemy/Enemy.service';
import { CombatService } from './game/enemy/combat/Combat.service';
import { PhasesService } from './game/phases/Phases.service';
import { GameStateService } from './state/GameState.service';
import { Scenario } from './scenario/Scenario.model';
import { TestScenario } from './scenario/TestScenario.service';
import { AssetsService } from './game-utils/assets/Assets.service';
import { CacheService } from './game-utils/cache/Cache.service';
import { StateWatcherService, GameStateWatchersInjectionToken } from './state/watchers/StateWatcher.service';
import StateWatchersLib from './StateWatchers.lib';
import { SaveService, SaveSerializer, SaveUnserializer } from './game-utils/saves/Save.service';
import { serializeForSave, unserilizeForLoad } from './SaveSerializers.utils';
import { DicesService } from './game/dice/Dice.service';
import { GameStateRepository } from './state/GameStateRepository.model';
import { AnimationService } from './game/game-object/animation/Animation.service';
import { GameActiveParser } from './game/active/parsers/ActiveParser.service';
import { GameInventoryService } from './game/active/GameInventory.service';
import { EffectResolverService } from './game-logic/effects/EffectResolver.service';
import { GameEntitiesManager } from './game-logic/GameEntityManager.service';
import { GameTermResolver } from './game-logic/game-state-machine/GameTermResolver.service';
import { PlayerCommunicatorImplementationService } from './ui/communicator-impl/PlayerCommunicatorImplementation.service';
import { PlayerCommunicatorInstance } from './player-comunication/PlayerComunicator.interface';
import { UIText } from './ui/texts/UIText.service';
import { IGameStateRepositoryToken } from './state/IGameStateRepository.model';


export const AppInjector = ReflectiveInjector.resolveAndCreate([
    ApplicationEntry,
    RenderingPipelineService,
    MeshFactory,
    CameraController,
    SceneComposer,
    TexturesFactory,
    { provide: TILE_SIZE, useValue: 350 },
    TilesFactory,
    { provide: TilePositionManager, useClass: AxialTilePositionManager },
    MapService,
    CharacterFactory,
    UIEventBinder,
    UIEventManager,
    GameObjectManager,
    SelectionService,
    InteractorsService,
    UIManager,
    WorldService,
    PlayerService,
    UIComponentResolver,
    TileModelParser,
    { provide: UIEventHandler, useExisting: UIEventBinder },
    EnemyService,
    CombatService,
    PhasesService,
    GameStateService,
    { provide: Scenario, useClass: TestScenario },
    AssetsService,
    CacheService,
    StateWatcherService,
    { provide: GameStateWatchersInjectionToken, useValue: StateWatchersLib },
    SaveService,
    { provide: SaveSerializer, useValue: serializeForSave },
    { provide: SaveUnserializer, useValue: unserilizeForLoad },
    DicesService,
    GameStateRepository,
    AnimationService,
    GameActiveParser,
    GameInventoryService,
    EffectResolverService,
    GameEntitiesManager,
    GameTermResolver,
    PlayerCommunicatorImplementationService,
    { provide: PlayerCommunicatorInstance, useExisting: PlayerCommunicatorImplementationService },
    { provide: IGameStateRepositoryToken, useExisting: GameStateRepository },
    UIText
]);
AppInjector.get(UIEventBinder);
AppInjector.get(WorldService)
