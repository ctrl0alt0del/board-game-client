import { GameStateWatcherCallback, StateWatcher } from "./state/watchers/StateWatcher.model";
import { AssetsService } from "./game-utils/assets/Assets.service";
import { Tile } from "./game/map/tiles/Tile";
import { MapService } from "./game/map/Map.service";
import { GameObjectProducer } from "./game/game-object/GameObjectProducer.model";
import { TileState, PlayerState, GameState, SectorRef, EnemyState, CombatState, InventoryItemState } from "./state/GameState.interface";
import { Player } from "./game/player/Player.model";
import { PlayerService } from "./game/player/Player.service";
import { TileSector } from "./game/map/tiles/TileSector.model";
import { Injector } from "injection-js";
import { injectorGet } from "./utils/Common.utils";
import { EnemyService } from "./game/enemy/Enemy.service";
import { CombatService } from "./game/enemy/combat/Combat.service";
import { Combat } from "./game/enemy/combat/Combat.model";
import { StateLensFactory } from "./utils/lens/StateLens.factory";
import { ArrayUtils } from "./utils/Array.utils";
import { GameInventoryService } from "./game/active/GameInventory.service";
import { Maybe } from "./utils/fp/Maybe";
import { EffectResolverService } from "./game-logic/effects/EffectResolver.service";
import { GameEntitiesManager } from "./game-logic/GameEntityManager.service";
import GameObservableStore from "./GameObservableStore";
import { ObservableStore } from "./state/observables/ObservableStore.model";

const toSector = (selector: (state: GameState) => SectorRef) => (state: GameState, injector: Injector) => injector.get(MapService).getSectorBySectorState(selector(state))

const CreateMapWatcher = new StateWatcher<TileState[]>(async (prevMap, nextMap, injector) => {
    const assets = injector.get(AssetsService);
    const map = injector.get(MapService);
    if (!prevMap && nextMap) {
        for (const tileState of nextMap) {
            const { position, tileName } = tileState;
            const producer = await assets.get<GameObjectProducer<Tile>>(tileName);
            const tile = producer.produce();
            map.putTile(position, tile);
        }
        map.compileMapGraph();
    }
}, state => state?.map);

const CreatePlayerMiniature = new StateWatcher<PlayerState>(async (prevPlayer, nextPlayer, injector) => {
    const playerService = injector.get(PlayerService);
    if (!prevPlayer && nextPlayer) {
        const player = await playerService.spawnPlayer('player_miniature', nextPlayer);
        ObservableStore.subject<Player>('currentPlayer')(GameObservableStore).next(player);
    }
}, state => state?.currentPlayer);

const MovePlayerMiniature = new StateWatcher<TileSector>((prevPlayerSector, nextPlayerSector, injector) => {
    const playerService = injector.get(PlayerService);
    if (!prevPlayerSector) {
        if (nextPlayerSector) {
            playerService.putPlayerAt(nextPlayerSector)
        }
    } else if (nextPlayerSector && prevPlayerSector !== nextPlayerSector) {
        playerService.movePlayerTo(nextPlayerSector);
    }
}, toSector(state => state?.currentPlayer?.sector));

const ExploreTile = new StateWatcher<TileState[]>((prev, next, injector) => {
    const map = injector.get(MapService)
    if (next.length) {
        for (let i = 0; i < next.length; i++) {
            const prevTile = prev[i], nextTile = next[i];
            if (nextTile.isFlipped && (!prevTile || !prevTile.isFlipped)) {
                const tile = map.getTileByName(nextTile.tileName);
                map.flipTile(tile);
            }
        }
    }
}, state => state?.map || []);

const SpawnEnemy = new StateWatcher<EnemyState[]>((prev, next, injector) => {
    const [map, enemies] = injectorGet(injector, [MapService, EnemyService])
    if (prev.length < next.length) {
        const { enemyKey, sector, isActive } = next[next.length - 1];
        enemies.spawnEnemyAtSector(enemyKey, map.getSectorBySectorState(sector), isActive);
    }
}, state => state?.enemies || []);

const StartCombat = new StateWatcher<CombatState>((prev, next, injector) => {
    const [players, enemies, combats] = injectorGet(injector, [PlayerService, EnemyService, CombatService])
    if (!prev && next) {
        const player = players.fromPlayerState(next.player);
        const enemy = enemies.getEnemyByKey(next.enemy.enemyKey);
        const combat = new Combat(enemy, player);
        combats.adjustCameraForCombat(combat)
    }
}, state => state?.currentCombat);

const ReceiveItem = new StateWatcher<InventoryItemState[]>((prev, next, injector) => {
    const [inventory, entities] = injectorGet(injector, [GameInventoryService, GameEntitiesManager])
    if (prev.length < next.length) {
        const newItems = Maybe.flat(ArrayUtils.filterNew(prev, next, a => b => a.activeId === b.activeId).map(item => inventory.fromGameState(item)));
        for(const item of newItems) {
            entities.register(item.active.entity);
        }

    }
}, state => StateLensFactory.inventory.get(state).orDefault([]))

export default [
    CreateMapWatcher,
    CreatePlayerMiniature,
    ExploreTile,
    MovePlayerMiniature,
    SpawnEnemy,
    StartCombat,
    ReceiveItem
];