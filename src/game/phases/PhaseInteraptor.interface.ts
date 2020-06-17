import { Injector } from "injection-js";

export type PhaseInteraptor = (injector: Injector) => Promise<boolean>;