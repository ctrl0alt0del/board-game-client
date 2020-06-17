import { Combat } from '../game/enemy/combat/Combat.model';
import { Injectable, Inject } from 'injection-js';
import { EnemyService } from '../game/enemy/Enemy.service';
import { PlayerService } from '../game/player/Player.service';
import { GameStateService } from './GameState.service';
import { Maybe } from '../utils/fp/Maybe';
import { GameInventoryItem } from '../game/active/GameInventoryItem.model';
import { StateLensFactory } from '../utils/lens/StateLens.factory';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CombatState, InventoryItemState, GameState } from './GameState.interface';
import { GameEffect } from '../game-logic/effects/GameEffect.model';
import { EffectResolverService } from '../game-logic/effects/EffectResolver.service';
import { GameInventoryService } from '../game/active/GameInventory.service';
import { Reader, MaybeReader } from '../utils/fp/Reader';
import { IGameStateRepository } from './IGameStateRepository.model';
import { LensUtils, ReadOnlyArrayLens } from '../utils/lens/StateLens.utils';
import { compose, checkIf, compose3 } from '../utils/Functions.utils';
import { isWeapon, Weapon } from '../game/active/Weapon.model';
import { ArrayUtils } from '../utils/Array.utils';
import { Objects } from '../utils/Object.utils';
import { PrimaryStatistics } from '../game-logic/data/Constants.utils';

@Injectable()
export class GameStateRepository implements IGameStateRepository {


    constructor(
        @Inject(PlayerService) private players: PlayerService,
        @Inject(GameStateService) private state: GameStateService,
        @Inject(EffectResolverService) private effects: EffectResolverService,
        @Inject(GameInventoryService) private inventory: GameInventoryService
    ) {

    }

    get currentCombat$() {
        return new Reader((enemies: EnemyService) => this.state.onStateUpdate.pipe(
            map(StateLensFactory.currentCombat.get),
            map(Maybe.map(combatState => {
                return this.combatStateToModel(combatState).resolve(enemies);
            }))
        ));
    }


    get currentCombat() {
        return MaybeReader.fromMaybe(StateLensFactory.currentCombat.get(this.state.currentValue).map(combat => this.combatStateToModel(combat)));
    }

    get currentPlayerStats$() {
        return this.state.map(compose(StateLensFactory.playerStats.get, Maybe.orDefault<PrimaryStatistics[]>([])));
    }

    get currentPlayerWeapon$() {
        const getPlayerEquipedWeapons = StateLensFactory.playerEquipedItems.filter(checkIf(this.inventory.IsItemWeapon));
        const toInventoryItems = compose3(getPlayerEquipedWeapons.get, Maybe.orDefault<InventoryItemState[]>([]), ArrayUtils.map(item => this.inventory.fromGameState(item) as Maybe<GameInventoryItem<Weapon>>));
        return this.state.map(compose(toInventoryItems, Maybe.flat));
    }

    get currentPlayerWeaponStats$() {
        return this.currentPlayerWeapon$.pipe(map(ArrayUtils.flatMap(compose(Objects.getProperty('active'), Objects.getProperty('abilities')))))
    }

    addToInventory(item: GameInventoryItem) {
        const lens = StateLensFactory.addToPlayerInventory();
        this.state.patchChanges([state => lens.set(state, item.toGameState())]);
    }

    get playerCapsAmount() {
        return this.state.map(state => StateLensFactory.currentPlayerCaps.get(state));
    }

    setSideEffectOutcome<T>(key: string, value: T) {
        this.state.patchChanges([state => StateLensFactory.gameSideEffectsOutcomes.set(state, Object.assign({}, StateLensFactory.gameSideEffectsOutcomes.get(state), { [key]: value }))])
    }

    getSideEffectOutcome<T>(key: string): Maybe<T> {
        return StateLensFactory.gameSideEffectsOutcomes.get(this.state.currentValue).map(outcomes => outcomes[key]);
    }

    addActiveEffectToEntity(entityId: string, effect: GameEffect) {
        return this.state.patchChanges([state => StateLensFactory.entityActiveEffects(entityId).resolve(this.effects).add(state, effect)])
    }

    entityActiveEffects(entityId: string) {
        return this.state.getByLens(StateLensFactory.entityActiveEffects(entityId).resolve(this.effects))
    }

    playerInventory(playerId: string) {
        return this.state.getByLens(StateLensFactory.getPlayerInventory(playerId).map(itemState => this.inventory.fromGameState(itemState).orDefault(undefined), item => item.toGameState())).asArray();
    }

    getEntitiesAffectingPlayer(playerId: string) {
        return new Reader((enemies: EnemyService) => {
            const currState = this.state.currentValue;
            return Maybe.flat(StateLensFactory
                .getEquipedItems(playerId)
                .get(currState)
                .asArray()
                .map(itemState => this.inventory.fromGameState(itemState).map(item => item.active.entity))
                .concat(StateLensFactory.currentCombat.get(currState).map(combat => enemies.getEnemyByKey(combat.enemy.enemyKey).entity))
            )
        })
    }


    private combatStateToModel(combatState: CombatState) {
        return new Reader((enemies: EnemyService) => {
            const player = this.players.fromPlayerState(combatState.player);
            const enemy = enemies.getEnemyByKey(combatState.enemy.enemyKey);
            return new Combat(enemy, player);
        });
    }
}