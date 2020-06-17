import { GameEffect, GameEffectApplicationType } from "./GameEffect.model";
import { callGameFun, gameConst, gameNumber } from "../game-state-machine/GameTerms";
import { PhaseType } from "../../game/phases/PhaseType.enum";

export const GameEffectLib = {
    getEnemyLevelGameEffect(lvl: number): GameEffect {
        return {
            id: 'enemy-lvl-game-effect',
            displayable: {
                imageSrc: "/text/hit_icon.png",
                text: "Рівень"
            },
            applicationTypes: [GameEffectApplicationType.HP, GameEffectApplicationType.Attack],
            start: [callGameFun('start_phase', gameConst(PhaseType.Combat))],
            end: null,
            operation: callGameFun('add', gameNumber(lvl))
        }
    },

    getArmorEffect(armorValue: number): GameEffect {
        return {
            id: 'armor',
            displayable: {
                imageSrc: '/text/armor_icon.png',
                text: "Броня"
            },
            applicationTypes: [GameEffectApplicationType.Armor],
            start: [callGameFun('start_phase', gameConst(PhaseType.Combat))],
            end: null,
            operation: callGameFun('add', gameNumber(armorValue))
        }
    }
}