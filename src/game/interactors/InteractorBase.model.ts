import { Injector } from "injection-js";

export abstract class InteractorBase {
    protected injector: Injector;
    useInjector(injector: Injector) {
        this.injector = injector;
    }
}