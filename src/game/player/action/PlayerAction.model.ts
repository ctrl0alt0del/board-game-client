import { Injector } from "injection-js";
import { PlayerActionType } from "../Player.service";
import { Subscription, Subject } from "rxjs";
import { GameStateService } from "../../../state/GameState.service";
import { PhasesService } from "../../phases/Phases.service";

export abstract class PlayerActionHandler {
    protected injector: Injector;
    protected state: GameStateService;
    protected phases: PhasesService;

    private subscriptions: Subscription[] = [];

    onActionStop = new Subject<void>();

    abstract get type(): PlayerActionType;

    setInjector(injector: Injector) {
        this.injector = injector;
        this.phases = injector.get(PhasesService);
        this.state = injector.get(GameStateService); 
    }

    abstract startAction(): void;

    stopAction() {
        for(const sub of this.subscriptions){
            sub.unsubscribe();
        }
        this.onActionStop.next();
    }

    protected handleSubscriptions(subs: Subscription[]) {
        this.subscriptions.push(...subs);
    }
}