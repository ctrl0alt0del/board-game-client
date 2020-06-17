import { Phase } from "./Phase.model";
import { PhaseData } from "./PhaseData.interface";
import { Injector } from "injection-js";

export class SimpleGamePhase<T extends PhaseData> extends Phase<T> {
    startPhaseAction: (injector: Injector) => Promise<void>;
    data: T;
    getData() {
        return this.data;
    }
    startPhase(injector: Injector) {
        if (this.startPhaseAction) {
            this.startPhaseAction(injector).then(() => {
                this.onPhaseEnd.next();
            });
        } else {
            this.onPhaseEnd.next()
        }
    }
}

export const createSimplePhase = <T>(data: T, startPhaseAction: (injector: Injector) => Promise<void>) => {
    return Object.assign(new SimpleGamePhase(), {
        data,
        startPhaseAction
    })
}