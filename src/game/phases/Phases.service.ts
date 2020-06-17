import { Injectable, Inject, Injector } from "injection-js";
import { Subject } from "rxjs";
import { PhaseData } from "./PhaseData.interface";
import { PhaseStartHandler, PhaseEndHandler } from "./PhaseHandlers";
import { Phase } from "./Phase.model";
import { first } from "rxjs/operators";
import { CustomSubscription } from "../../utils/CustomSubscription.model";

export interface PhaseSubscription {
    unsubscribe(): void;
}

@Injectable()
export class PhasesService {
    private onPhaseStartHandlers: PhaseStartHandler[] = [];
    private onPhaseEndHandlers: PhaseEndHandler[] = [];

    private onPhaseEnd = new Subject<PhaseData>();
    

    constructor(@Inject(Injector) private injector: Injector) {

    }

    async initiatePhaseStart(phase: Phase) {
        const data = phase.getData();
        for (const handler of this.onPhaseStartHandlers) {
            const interpator = handler(data);
            if (interpator) {
                const preventPhase = await interpator(this.injector);
                phase.prevent(preventPhase);
            }
        }
        if (!phase.isPrevented) {
            phase.startPhase(this.injector);
            await phase.onPhaseEnd.pipe(first()).toPromise();
            await this.initiatePhaseEnd(data);
        }

    }

    addOnPhaseStartHandler(handler: PhaseStartHandler): PhaseSubscription {
        this.onPhaseStartHandlers.push(handler);
        return new CustomSubscription(() => this.onPhaseStartHandlers = this.onPhaseStartHandlers.filter(handler2 => handler2 !== handler));
    }

    addOnPhaseEndHandler(handler: PhaseEndHandler): PhaseSubscription {
        this.onPhaseEndHandlers.push(handler);
        return {
            unsubscribe: () => {
                this.onPhaseEndHandlers = this.onPhaseEndHandlers.filter(handler2 => handler2 !== handler);
            }
        }
    }

    private async initiatePhaseEnd(phaseData: PhaseData) {
        for (const handler of this.onPhaseEndHandlers) {
            await handler(phaseData);
        }
    }
}