import { Injector } from "injection-js";
import { GameLogicConstant, GameValue } from "./GameTerms";
import { PhasesService } from "../../game/phases/Phases.service";
import { InGameEvent } from "./InGameEvent.model";
import { PhaseUtils } from "../../game/phases/Phases.utils";
import { GameEffectOperation, GameEffectOperationType } from "../effects/GameEffect.model";
import 'reflect-metadata'
import { PureReader } from "../../utils/fp/Reader";
import { GameEngineFunction } from "./GameTermResolver.service";
import { PlayerCommunicatorInstance } from "../../player-comunication/PlayerComunicator.interface";
import { GameTermContext } from "./GameTermContext.interface";
import { PlayerCommunicationUtils } from "../../player-comunication/PlayerCommunication.utils";
import { GameStateService } from "../../state/GameState.service";
import { StateLensFactory } from "../../utils/lens/StateLens.factory";
import { EffectResolverService } from "../effects/EffectResolver.service";
import { constant, whatever } from "../../utils/Functions.utils";


export const StdGameFunctionsLib: GameEngineFunction[] = [
    function start_phase(phaseNameVar: string) {
        return (injector) => {
            const phases = injector.get(PhasesService);
            return (handler) => {
                phases.addOnPhaseStartHandler(PhaseUtils.pickStartPhase(phaseNameVar)(() => {
                    handler();
                    return async () => false;
                }))
            }
        }
    },
    function add(value: number) {
        return () => ({
            function: a => value + a,
            operation: GameEffectOperationType.ADD,
            value: value
        })
    },
    function do_spend_caps(this: GameTermContext, capsValue: number, reasonKey: string) {
        return async (injector) => {
            const communicator = injector.get(PlayerCommunicatorInstance);
            const isSpend = await communicator.requestCaps(capsValue, reasonKey, PlayerCommunicationUtils.gameTermContextToCommunicationContext(this));

            if (isSpend) {
                injector.get(GameStateService).patchChanges([StateLensFactory.giveCapsToCurrentPlayer(-capsValue)])
            }
            return isSpend;
        }
    },
    function is_effect_outcome(effectName: string, expectedValue: string) {
        return (injector) => {
            const effectResolver = injector.get(EffectResolverService);
            const result = effectResolver.checkEffectOutcome(effectName, expectedValue)
            return result !== false ? 'TRUE' : 'FALSE';
        }
    },
    function if_(value: string, next: any, otherwise: any) {
        return () => {
            if (value !== 'FALSE') {
                return next;
            } else {
                return otherwise;
            }
        }
    },
    function no_op() {
        return () => {
            return {
                value: 0,
                function: whatever(),
                operation: GameEffectOperationType.NONE
            }
        }
    },
    function replace(value) {
        return () => ({
            value,
            function: constant(value),
            operation: GameEffectOperationType.REPLACE
        })
    }
]