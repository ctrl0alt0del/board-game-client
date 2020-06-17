import { PlayerActionType } from "../game/player/Player.service";

export interface UIEventsHandlerService {
    onPlayerActionSelect(type: PlayerActionType): void;
}