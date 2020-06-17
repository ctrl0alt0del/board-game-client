import { PhaseStartHandler } from "./PhaseHandlers";
import { PhaseData } from "./PhaseData.interface";

export class PhaseUtils {
    static pickStartPhase<T extends PhaseData>(phaseName: string) {
        return (phaseCallback: PhaseStartHandler<T>) => (data: T) => data.name === phaseName && phaseCallback(data);
    }
}