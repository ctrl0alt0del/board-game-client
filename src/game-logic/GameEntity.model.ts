import { GameEffect, GameEffectApplicationType } from "./effects/GameEffect.model";
import { CalculationBreakdown } from "./CalculationBreakdown.model";
import { EntityState } from "../state/GameState.interface";

export class GameEntity {

    private _activeEffects: GameEffect[] = [];

    get activeEffects() {
        return [...this._activeEffects];
    }

    constructor(readonly id: string, public effects: GameEffect[]) {

    }

    addActiveEffect(effect: GameEffect) {
        if (this.hasEffect(effect) && !this.isEffectActive(effect)) {
            this._activeEffects.push(effect)
        }
    }

    removeActiveEffect(effect: GameEffect) {
        if (this.hasEffect(effect) && this.isEffectActive(effect)) {
            this._activeEffects = this._activeEffects.filter(e => e.id !== effect.id);
        }
    }

    hasEffect(effect: GameEffect) {
        return this.effects.some(ownEffect => ownEffect.id === effect.id);
    }

    isEffectActive(effect: GameEffect) {
        return this.effects.some(activeEffect => activeEffect.id === effect.id);
    }

    toGameState(): EntityState {
        return {
            activeEffects: this.activeEffects.map(effect => ({ effectId: effect.id })),
            entityId: this.id
        }
    }
}