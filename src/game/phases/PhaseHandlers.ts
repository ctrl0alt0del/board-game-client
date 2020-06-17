import { PhaseData } from "./PhaseData.interface";
import { PhaseInteraptor } from "./PhaseInteraptor.interface";
export type PhaseStartHandler<T extends PhaseData = PhaseData> = (phase: T) => PhaseInteraptor | void;
export type PhaseEndHandler<T extends PhaseData = PhaseData> = (phase: T) => Promise<void> | void;
