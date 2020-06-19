import { ObservableStore } from "./ObservableStore.model";
import { compose } from "../../utils/Functions.utils";
import { Observable, pipe } from "rxjs";
import { ISettings } from "../../settings/SettingsGeneral";
import { map } from "rxjs/operators";
import { pickKey } from "../../utils/Common.utils";

export const getLightSettings = compose(
    ObservableStore.get<ISettings>('settings'),
    pipe(
        map(pickKey('light'))
    )
)