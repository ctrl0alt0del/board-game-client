import { Injectable, Inject } from "injection-js";
import { GameState, PlayerState } from "./GameState.interface";
import { Player } from "../game/player/Player.model";
import { v4 } from "uuid";
import { Scenario } from "../scenario/Scenario.model";
import { BehaviorSubject, Observable } from "rxjs";
import { SaveService } from "../game-utils/saves/Save.service";
import { Nullable, SuperMaybe, Maybe } from '../utils/fp/Maybe';
import { map } from "rxjs/operators";
import { ReadOnlyLens } from "../utils/lens/StateLens.utils";

const DISABLE_SAVED_GAME_LOAD = false;
const DISABLE_SAVING = false;

@Injectable()
export class GameStateService {

    private state: GameState;

    onStateUpdate = new BehaviorSubject<GameState>(null);

    get currentValue(): Nullable<GameState> {
        return this.onStateUpdate.getValue();
    }

    constructor(
        @Inject(Scenario) private scenario: Scenario,
        @Inject(SaveService) private saves: SaveService
    ) {

    }

    map<T>(mapFn: (state: GameState) => T): Observable<T> {
        return this.onStateUpdate.pipe(map(mapFn));
    }

    patchChanges(patches: ((state: GameState) => SuperMaybe<GameState>)[], save = true) {
        const nextState = patches.reduce<GameState>((result, patchFn) => Object.assign({}, Maybe.from(patchFn(result)).orDefault(this.getDefaultState())), this.state);
        if (nextState === this.state) {
            throw new Error("GameState have to be immutable.");
        }
        if (save && !DISABLE_SAVING) {
            this.saves.save(nextState);
        }
        this.onStateUpdate.next(this.state = nextState);
    }

    getByLens<B>(lens: ReadOnlyLens<GameState,B>) {
        return lens.get(this.state);
    }

    async initState() {
        let initialState = await this.saves.load();
        if (!initialState || DISABLE_SAVED_GAME_LOAD) {
            initialState = this.getDefaultState();
        }
        this.patchChanges([() => initialState], false);

    }

    private getDefaultState(): GameState {
        const mapState = this.scenario.generateMapState();
        const currentPlayer = new Player('self');
        const currentPlayerState: PlayerState = {
            id: currentPlayer.id,
            statistics: currentPlayer.statistics,
            sector: null,
            capsAmount: 3,
            expiriencePoint: 0,
            level: 1,
            healtpPoint: 20,
            radiationPoint: 0
        };
        return {
            currentPlayer: currentPlayerState,
            players: [currentPlayerState],
            map: mapState,
            enemies: [],
            currentCombat: null,
            sideEffectsResult: {},
            inventory: [],
            entities: []
        };
    }
}