import { compose } from "../utils/Functions.utils";
import { loadJsonFile } from "../utils/Files.utils";
import { LensUtils } from "../utils/lens/StateLens.utils";
import { pipe, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { log } from "../utils/Common.utils";

export enum SettingsQuality {
    LOW,
    MEDIUM,
    HIGH
}

export interface ISettings {
    light: SettingsQuality;
}

const lightSettings = LensUtils.key('light')

const getDefaultGameSettings = () => of({
    light: SettingsQuality.LOW
} as ISettings)

export const toGameSettings = (input: any): ISettings => ({
    light: lightSettings.get(input).map((val: string) => SettingsQuality[val.toUpperCase()]).orDefault(SettingsQuality.LOW)
})

export const getGameSettings = compose(
    loadJsonFile,
    pipe(
        map(compose(toGameSettings, log('GameSettings is: '))),
        catchError(getDefaultGameSettings)
    )
)