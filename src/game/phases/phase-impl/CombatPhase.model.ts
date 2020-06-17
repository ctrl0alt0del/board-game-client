import { Phase } from "../Phase.model";
import { Combat } from "../../enemy/combat/Combat.model";
import { CombatPhaseData } from "./PhaseDataImpl.interface";
import { PhaseType } from "../PhaseType.enum";
import { Injector } from "injection-js";
import { CombatService } from "../../enemy/combat/Combat.service";
import { GameStateService } from "../../../state/GameState.service";
import { GameStateUpdateUtils } from "../../../state/GameStateUpdater.utils";

export class CombatPhase extends Phase {
    constructor(private combatModel: Combat) {
        super();
    }

    getData(): CombatPhaseData{
        return {
            name: PhaseType.Combat,
            combat: this.combatModel
        }
    }

    startPhase(injector: Injector) {
        const combatService = injector.get(CombatService);
        const stateService = injector.get(GameStateService);
        stateService.patchChanges([GameStateUpdateUtils.startCombat(this.combatModel)]);
        //combatService.adjustCameraForCombat(this.combatModel.enemy, this.combatModel.player.character)
    }
}