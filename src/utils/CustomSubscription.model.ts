import { Subscription } from "rxjs";

export class CustomSubscription extends Subscription {
    constructor(private onUnsubscribe: () => void) {
        super();
    }
    unsubscribe(){
        this.onUnsubscribe();
    }
}