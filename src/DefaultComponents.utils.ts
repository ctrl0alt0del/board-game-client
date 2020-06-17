
import { UIComponentResolver } from "./ui/UIComponentResolver.service";
import { PLAYER_ACTION_MENU_ITEM, GAME_MAP, GAME_HUD } from "./ui/UIManager.service";
import { PlayerActionMenuItem } from "./ui/react/player-action-menu-item/PlayerActionMenuItem.component";
import { Injector } from "injection-js";
import { UIEventBinder } from "./controls/UIEventBinder.service";
import { UIMap } from "./ui/react/map/Map.component";
import { MapService } from "./game/map/Map.service";
import { CameraController } from "./camera/CameraController";
import { HUDComponent } from "./ui/react/hud/HUD.component";
import { PipboyComponent } from "./ui/react/pipboy/Pipboy.component";
import { FalloutGameUITypes } from "./AppConstants";
import { StatsMenu } from "./ui/react/stats-menu/StatsMenu.component";
import { RenderingPipelineService } from "./render/RenderingPipeline.service";
import { CombatService } from "./game/enemy/combat/Combat.service";
import { PhasesService } from "./game/phases/Phases.service";
import { StateWatcherService } from "./state/watchers/StateWatcher.service";
import { CombatOverlay } from "./ui/react/combat-overlay";
import { DicesService } from './game/dice/Dice.service';
import { GameStateRepository } from "./state/GameStateRepository.model";

export const linkDefaultComponent = (uiResolver: UIComponentResolver) => {
    uiResolver.linkComponent(PLAYER_ACTION_MENU_ITEM, PlayerActionMenuItem, (injector: Injector, props) => {
        const eventsBinder = injector.get(UIEventBinder);
        return {
            onClick: () => {
                eventsBinder.onPlayerActionSelect(props.action)
            }
        }
    });
    uiResolver.linkComponent(GAME_MAP, UIMap, (injector) => {
        return {
            cameraCtrl: injector.get(CameraController),
            mapService: injector.get(MapService)
        }
    });
    uiResolver.linkComponent(GAME_HUD, HUDComponent, (injector: Injector) => {
        const renderingPipeline = injector.get(RenderingPipelineService);
        return {
            frameRateSubject: renderingPipeline.frameRate
        }
    });
    uiResolver.linkComponent(FalloutGameUITypes.PIPBOY, PipboyComponent);
    uiResolver.linkComponent(FalloutGameUITypes.STATS_MENU, StatsMenu);
    uiResolver.linkComponent(FalloutGameUITypes.COMBAT_OVERLAY, CombatOverlay)
}