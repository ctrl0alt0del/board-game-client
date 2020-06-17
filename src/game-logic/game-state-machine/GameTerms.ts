export type GameLogicTerm = GameLogicConstant | GameLogicFunction | GameValue;

export interface GameValue {
    value: number;
}

export interface GameLogicConstant {
    name: string;
}

export interface GameLogicFunction extends GameLogicConstant {
    args: GameLogicTerm[]
}

export const callGameFun = (name: string, ...args: (GameLogicTerm|GameValue)[]): GameLogicFunction => {
    return {
        name: name,
        args
    }
}

export const gameConst = (name: string | number): GameLogicConstant => {
    return { name: '' + name }
}

export const gameNumber = (val: number): GameValue => {
    return { value: val }
}