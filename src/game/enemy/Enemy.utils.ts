import { EnemyType, Enemy } from "./Enemy.model";
import { GameEffectApplicationType } from "../../game-logic/effects/GameEffect.model";
import { GameEntitiesManager } from "../../game-logic/GameEntityManager.service";
import { PureReader } from "../../utils/fp/Reader";
import { CalculationItem, CalculationBreakdown } from "../../game-logic/CalculationBreakdown.model";
import { GameState } from "../../state/GameState.interface";

export const getTokenBackTextureUrlByType = (type: EnemyType) => {
    switch(type) {
        case EnemyType.INSECTS:
            return 'text/enemies/enemy_back_1.png';
    }
}

type EntityManagerReader<T> = PureReader<GameEntitiesManager, T>

export const getEnemyRequiredHitsToKill = (enemy: Enemy): EntityManagerReader<CalculationBreakdown> => (entityManager) => {
    return new CalculationBreakdown(entityManager.resolveEntityEffects(enemy.entity, [GameEffectApplicationType.HP, GameEffectApplicationType.Armor]))
}

export const getEnemyAttack = (enemy: Enemy): EntityManagerReader<CalculationBreakdown> => (entityManager) => {
    return new CalculationBreakdown(entityManager.resolveEntityEffects(enemy.entity, [GameEffectApplicationType.Attack]));
}