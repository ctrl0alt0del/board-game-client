import { PlayerActionHandler } from "./PlayerAction.model";
import { PlayerActionType } from "../Player.service";
import { Subscription } from "rxjs";

export class GroupedActionHandlers extends PlayerActionHandler {
    
    private onStopActionsSubscriptions: Subscription[] = [];

    constructor(readonly actions: PlayerActionHandler[]) {
        super();
    }
    get type(): PlayerActionType {
        return null;
    }
    startAction(): void {
        this.onStopActionsSubscriptions = this.actions.map(action => {
            action.startAction();
            return action.onActionStop.subscribe(()=>{
                this.onStopActionsSubscriptions.forEach(sub => sub.unsubscribe())
                this.stopOtherActions(action);
            });
        });
    }

    private stopOtherActions(excludeAction: PlayerActionHandler) {
        for(const action of this.actions) {
            if(action !== excludeAction) {
                action.stopAction();
            }
        }
    }

}