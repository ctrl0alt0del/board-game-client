import { Injectable, Inject, Injector } from "injection-js";
import { GameEffect, GameEffectApplicationType, GameEffectOperation } from "./GameEffect.model";
import { GameTermResolver } from "../game-state-machine/GameTermResolver.service";
import { Maybe } from "../../utils/fp/Maybe";
import { GameActionCausedByType } from "../game-state-machine/GameActionCausedByType.enum";
import { Subject } from "rxjs";
import { GameEffectState } from "../../state/GameState.interface";
import { IGameStateRepositoryToken, IGameStateRepository } from "../../state/IGameStateRepository.model";

type PhaseHandler = (handler: () => void) => void;

@Injectable()
export class EffectResolverService {

    private registeredEffects: GameEffect[] = [];

    constructor(
        @Inject(GameTermResolver) private resolver: GameTermResolver,
        @Inject(Injector) private injector: Injector,
    ) {

    }

    register(effect: GameEffect) {
        const repository = this.injector.get<IGameStateRepository>(IGameStateRepositoryToken);
        this.registeredEffects.push(effect);
        const start$ = this.resolver.compileFunction<PhaseHandler>(effect.start[0], {
            sourceType: GameActionCausedByType.GameEffect,
            source: effect
        });
        const effectActivationSubject = new Subject<boolean>();
        start$.map(fn => fn(async () => {
            if(effect.applicationTypes.includes(GameEffectApplicationType.SideEffect)) {
                await Maybe.from(effect.action).map(async actions => {
                    for(const action of actions) {
                        const result = await this.resolver.compilePromiseFunction(action, {
                            sourceType: GameActionCausedByType.GameEffect,
                            source: effect
                        }).toPromise();
                        repository.setSideEffectOutcome(effect.id, result.orDefault('FALSE'));
                    }
                }).toPromise();
            } else {
                effectActivationSubject.next(true);
            }
            return false;
        })); 
        return effectActivationSubject;
    }

    resolve<T>(effect: GameEffect): Maybe<GameEffectOperation> {
        return Maybe.from(effect.operation).map(op => {
            return this.resolver.compileOperation(op, {
                sourceType: GameActionCausedByType.GameEffect,
                source: effect
            });
        });
    }

    checkEffectOutcome(effectId: string, expectedValue: string) {
        const repository = this.injector.get<IGameStateRepository>(IGameStateRepositoryToken); //TODO: Possibly circular dependency
        return repository.getSideEffectOutcome(effectId).map(outcome => this.resolver.isEqual({name: expectedValue}, outcome)).orDefault(false)
    }

    fromGameState(effectState: GameEffectState) {
        return this.registeredEffects.find(effect => effect.id === effectState.effectId);
    }
} 