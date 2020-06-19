import { ObservableStore } from "./state/observables/ObservableStore.model";
import { getGameSettings } from "./settings/SettingsGeneral";
import { Subject } from "rxjs";

export default ObservableStore.create({
    settings: getGameSettings('settings/settings.json'),
    currentPlayer: new Subject()
})