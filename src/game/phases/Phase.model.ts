import { PhaseData } from "./PhaseData.interface";
import { Subject } from "rxjs";
import { Injector } from "injection-js";

export abstract class Phase<T extends PhaseData=PhaseData> {

    private _isPrevented: boolean = false;

    get isPrevented() {
        return this._isPrevented;
    }

    onPhaseEnd = new Subject<void>();

    abstract getData(): T;

    abstract startPhase(injector: Injector): void;

    prevent(value: boolean) {
        this._isPrevented = this._isPrevented || value;
    }

}