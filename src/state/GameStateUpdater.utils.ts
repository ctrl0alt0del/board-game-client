import { Enemy } from "../game/enemy/Enemy.model";
import { GameState } from "./GameState.interface";
import { Combat } from "../game/enemy/combat/Combat.model";

type ValueOfGameState = GameState[keyof GameState];

export class GameStateUpdateUtils {
    static spawnEnemy(enemy: Enemy) {
        return this.addToArray('enemies', [enemy.toGameState()])
    }

    static startCombat(combat: Combat) {
        return (state: GameState) => Object.assign({}, state, {
            currentCombat: {enemy: combat.enemy.toGameState(), player: combat.player.toGameState()}
        })
    }

    static addToArray<T extends ValueOfGameState>(arrayName: keyof GameState, objectToAdd: T) {
        return (state: GameState) => {
            const array = state[arrayName] as T[];
            return Object.assign({}, state, {
                [arrayName]: array.concat(objectToAdd)
            })
        }
    }
}