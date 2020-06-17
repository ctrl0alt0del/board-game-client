import { PlayerCommunicator, CommunicationContext } from "../../player-comunication/PlayerComunicator.interface";
import { Subject } from "rxjs";
import { first, tap } from "rxjs/operators";

export interface DisplayRequestCapsDialogData {
    value: number,
    context: CommunicationContext,
    reasonText: string
}

export class PlayerCommunicatorImplementationService implements PlayerCommunicator{

    displayRequestCapsDialog = new Subject<DisplayRequestCapsDialogData|null>();

    onRequestCapsResult = new Subject<boolean>();

    async requestCaps(value: number, reasonText: string, context: CommunicationContext) {
        this.displayRequestCapsDialog.next({value, reasonText, context});
        return this.onRequestCapsResult.pipe(first(), tap(()=>this.displayRequestCapsDialog.next(null))).toPromise()
    }
}