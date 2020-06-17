import { Injector } from "injection-js";
import { GameState } from "../GameState.interface";

export type GameStateWatcherCallback<T> = (prevState: T, nextState: T, injector: Injector) => void | Promise<void>;

export class StateWatcher<T = GameState> {
    injector: Injector;

    constructor(private onStateChange: GameStateWatcherCallback<T>, private selector?: (state: GameState, injector: Injector) => T) {

    }

    run(prevState: GameState, nextState: GameState) {
        const prevArg = this.selector ? this.selector(prevState, this.injector) : prevState;
        const nextArg = this.selector ? this.selector(nextState, this.injector) : nextState;
        return this.onStateChange(prevArg as T, nextArg as T, this.injector);
    }
}