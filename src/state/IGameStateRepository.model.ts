import { Combat } from "../game/enemy/combat/Combat.model";
import { EnemyService } from "../game/enemy/Enemy.service";
import { Maybe } from "../utils/fp/Maybe";
import { GameInventoryItem } from "../game/active/GameInventoryItem.model";
import { Observable } from "rxjs";
import { GameEffect } from "../game-logic/effects/GameEffect.model";
import { Reader, MaybeReader } from "../utils/fp/Reader";
import { InjectionToken } from "injection-js";

export const IGameStateRepositoryToken = new InjectionToken('IGameStateRepositoryToken');

export interface IGameStateRepository {
    readonly currentCombat$: Reader<EnemyService, Observable<Maybe<Combat>>>;
    readonly currentCombat: MaybeReader<EnemyService, Combat>;
    readonly playerCapsAmount: Observable<Maybe<number>>;
    addToInventory(item: GameInventoryItem): void;
    setSideEffectOutcome<T>(key: string, value: T): void;
    getSideEffectOutcome<T>(key: string): Maybe<T>;
    addActiveEffectToEntity(entityId: string, effect: GameEffect): void;
    entityActiveEffects(entityId: string): Maybe<{}>;
    getEntitiesAffectingPlayer(playerId: string): Reader<EnemyService, {}>;
}
