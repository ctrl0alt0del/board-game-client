import { Injectable, Inject, Injector, InjectionToken } from "injection-js";
import { GameStateService } from "../GameState.service";
import { GameStateWatcherCallback, StateWatcher } from "./StateWatcher.model";
import { pairwise } from "rxjs/operators";
import { GameState } from "../GameState.interface";
import { CustomSubscription } from "../../utils/CustomSubscription.model";

export type GameStateWatchers = StateWatcher[];
export const GameStateWatchersInjectionToken = new InjectionToken<GameStateWatchers>('GameStateWatchers')

@Injectable()
export class StateWatcherService {

    private watchers: StateWatcher<any>[] = [];

    constructor(
        @Inject(Injector) private injector: Injector,
        @Inject(GameStateService) private state: GameStateService,
        @Inject(GameStateWatchersInjectionToken) watchers: GameStateWatchers
    ) {
        for(const watcher of watchers) {
            this.addWatcher(watcher);
        }
    }

    startWatch() {
        this.state.onStateUpdate.pipe(pairwise()).subscribe(([prev, next]) => {
            this.runWatchers(prev, next);
        });
    }

    addWatcher<T>(stateWatcher: StateWatcher<T>) {
        stateWatcher.injector = this.injector;
        this.watchers.push(stateWatcher);
        return new CustomSubscription(()=> this.watchers = this.watchers.filter(watcher => watcher !== stateWatcher))
    }

    private async runWatchers(prev: GameState, next: GameState) {
        for(const watcher of this.watchers) {
            const res = watcher.run(prev, next);
            if(res instanceof Promise) {
                await res;
            }
        }
    }

}