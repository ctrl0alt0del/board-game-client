import { loadFileViaLoader } from "../../utils/Files.utils"
import { tryParseJSON } from "../../utils/fp/Either.utils"
import React from "react";

export type TextDictionary = {[key: string]: string};

export const getTextDictionary = (path: string) => {
    return loadFileViaLoader(path)
        .asyncMap(content => content.toString())
        .asyncMap(str => tryParseJSON<TextDictionary>(str))
}
