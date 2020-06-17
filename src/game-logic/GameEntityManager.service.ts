import { Injectable, Inject } from "injection-js";
import { GameEntity } from "./GameEntity.model";
import { EffectResolverService } from "./effects/EffectResolver.service";
import { GameEffectApplicationType, GameEffect } from "./effects/GameEffect.model";
import { CalculationItem } from "./CalculationBreakdown.model";
import { ArrayUtils } from "../utils/Array.utils";
import { Maybe } from "../utils/fp/Maybe";
import { GameStateRepository } from "../state/GameStateRepository.model";

@Injectable()
export class GameEntitiesManager {

    constructor(@Inject(EffectResolverService) private effects: EffectResolverService,
        @Inject(GameStateRepository) private repository: GameStateRepository) {

    }

    register(entity: GameEntity) {
        for (const effect of entity.effects) {
            this.effects.register(effect).subscribe(isActive => isActive ? this.repository.addActiveEffectToEntity(entity.id, effect) : entity.removeActiveEffect(effect))
        }
    }

    resolveEntityEffects(entity: GameEntity, applicationTypes: GameEffectApplicationType[]): CalculationItem[] {
        const activeEffects = Maybe.from(this.repository.entityActiveEffects(entity.id));
        const operations = activeEffects.map(effects =>
             effects.filter(effect => ArrayUtils.hasIntersection(effect.applicationTypes, applicationTypes))
             .map(effect => this.getEffectOperation(effect))
        );
        return operations.map(maybeCalcItem => Maybe.flat(maybeCalcItem)).orDefault([]);
    }

    private getEffectOperation(effect: GameEffect): Maybe<CalculationItem> {
        return this.effects.resolve(effect).map(operation => ({
            source: effect,
            operation: operation
        }));
    }
}