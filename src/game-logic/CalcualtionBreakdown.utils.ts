import { Reader } from "../utils/fp/Reader";
import { GameStateRepository } from "../state/GameStateRepository.model";
import { GameEntitiesManager } from "./GameEntityManager.service";
import { GameEffectApplicationType, GameEffectOperationType } from "./effects/GameEffect.model";
import { CalculationBreakdown, CalculationItem, withDisplayable } from "./CalculationBreakdown.model";
import { GameEntity } from "./GameEntity.model";
import { Injector } from "injection-js";
import { injectorGet } from "../utils/Common.utils";
import { EnemyService } from "../game/enemy/Enemy.service";
import { Player } from "../game/player/Player.model";
import { Weapon } from "../game/active/Weapon.model";
import { ArrayUtils } from "../utils/Array.utils";
import { PrimaryStatistics, primaryStatsToDisplayable } from "./data/Constants.utils";
import { map } from "rxjs/operators";
import { concat, zip } from "rxjs";
import { unzipArgsFor, add, compose } from "../utils/Functions.utils";

const rerollsFromWeapon = (playerStats: PrimaryStatistics[], weaponStats: PrimaryStatistics[]) => {
    return ArrayUtils.intersection(playerStats, weaponStats);
}

const toAdditiveOperation = (value: number) => (source: withDisplayable) : CalculationItem => ({operation: {function: add(value), operation: GameEffectOperationType.ADD, value: value}, source: source})

export const rerollsCount = new Reader(([injector, playerId]: [Injector, string]) => {
    const [repository, entities, enemies] = injectorGet(injector, [GameStateRepository, GameEntitiesManager, EnemyService]);
    const entitiesList = repository.getEntitiesAffectingPlayer(playerId).resolve(enemies);
    const fromEffects = entitiesList.flatMap((entity: GameEntity) => entities.resolveEntityEffects(entity, [GameEffectApplicationType.RerollsCount]));
    return zip(
        repository.currentPlayerStats$,
        repository.currentPlayerWeaponStats$
    ).pipe(
        map(unzipArgsFor(rerollsFromWeapon)),
        map(ArrayUtils.map(compose(primaryStatsToDisplayable, toAdditiveOperation(1)))),
        map(items => new CalculationBreakdown(items.concat(fromEffects)))
    );
})