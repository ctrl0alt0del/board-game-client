import { GameEffectDisplayData } from "./Displayable.interface";
import { GameLogicFunction } from "../game-state-machine/GameTerms";
import { GameData } from "../../language/impl/GameData.interface";
import { MapFunction, Semigroup } from "../../utils/Functions.utils";
import { Maybe, SuperMaybe } from "../../utils/fp/Maybe";

export enum GameEffectApplicationType {
    HP,
    Armor,
    Attack,
    RerollsCount,
    SideEffect
}

export enum GameEffectOperationType {
    NONE,
    ADD,
    REPLACE
}

export interface GameEffectOperation {
    function:  MapFunction<number>;
    operation: GameEffectOperationType,
    value: number
};

export enum GameEffectOutcomeType {
    Value,
    Operation
}

export interface GameEffect {
    id: string
    start: GameLogicFunction[],
    end: GameLogicFunction[]
    displayable: GameEffectDisplayData;
    applicationTypes: GameEffectApplicationType[],
    operation: SuperMaybe<GameLogicFunction>
    action?: GameLogicFunction[]
}

export const getGameEffectFromGameData = (id: string, gameData: GameData, image: string, name: string): GameEffect => {
    return {
        id,
        applicationTypes: [GameEffectApplicationType[gameData.get<string>('application')]],
        displayable: {
            imageSrc: image,
            text: name
        },
        end: gameData.get<GameLogicFunction[]>('end'),
        start: gameData.get<GameLogicFunction[]>('start'),
        operation: gameData.maybeGet<GameLogicFunction[]>('operation').map(array => array[0]),
        action: Maybe.from(gameData.getArray<GameLogicFunction>('action')).orDefault([])
    }
}