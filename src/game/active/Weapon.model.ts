import { GameItem } from "./GameItem.model";
import { GameAbilities } from "../GameConstants.utils";
import { GameData } from "../../language/impl/GameData.interface";
import { getPrimaryStatByLetter, PrimaryStatistics } from "../../game-logic/data/Constants.utils";
import { getActiveType, GameActive } from "./GameActive.model";
import { GameEffect, getGameEffectFromGameData } from "../../game-logic/effects/GameEffect.model";

export interface Weapon extends GameItem {
    abilities: PrimaryStatistics[]
    isRanged: boolean
}

export const isWeapon = (active: GameActive) => active.kind === 'WEAPON';

export const factoryWeaponFromGameData = (id: string, data: GameData): Weapon => {
    const imageSrc = data.get<string>('image');
    const name = data.get<string>('name');
    return {
        id,
        kind: 'WEAPON',
        abilities: data.maybeGet<string>('rerolls').map(letters => [...letters].map(char => getPrimaryStatByLetter(char))).orDefault([]),
        isRanged: data.getBoolean('ranged'),
        cost: data.getNumber('cost'),
        description: data.get<string>('description'),
        effects: data.get<GameData>('effects').mapKeyValuePairs<GameData, GameEffect>((key, value) => getGameEffectFromGameData(key, value, imageSrc, name)),
        type: getActiveType(data.get<string>("activeType")),
        image: imageSrc,
        name: name,
        toGameState(palyerId, isEquiped) {
            return {
                activeId: id,
                entityId: id,
                isEquiped: isEquiped,
                owner: palyerId
            }
        }
    }
}