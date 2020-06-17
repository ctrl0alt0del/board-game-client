import { GameTermContext } from "../game-logic/game-state-machine/GameTermContext.interface";
import { CommunicationContext } from "./PlayerComunicator.interface";

export class PlayerCommunicationUtils {
    static gameTermContextToCommunicationContext(context: GameTermContext): CommunicationContext {
        return {
            causedBy: context.sourceType,
            source: context.source
        }
    }
}