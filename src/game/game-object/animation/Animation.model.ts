import { Point } from '../../../physics/Point.model';
export type GameAnimationTickFunction = (passedMs: number, deltaMs: number) => void;

export type GameAnimationFunction = (koef: number, deltaMs: number) => void;

export interface GameAnimation {
    duration: number,
    tick: GameAnimationTickFunction
}
