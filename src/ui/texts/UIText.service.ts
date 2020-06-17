import { Injectable } from "injection-js";
import { FileLoader } from "three";
import { getTextDictionary, TextDictionary } from "./UIText.utils";


export type UANumberConjugation = {
    one: string;
    upTo4: string;
    many: string;
};

@Injectable()
export class UIText {

    private fileLoader = new FileLoader();

    private dictionary?: TextDictionary;

    async loadTextJSON(path: string) {
        const res = await getTextDictionary(path).resolve(this.fileLoader);
        res.tap(err => { }, dict => this.dictionary = dict);
    }

    getText(key: string) {
        if (!this.dictionary) {
            return `no-dictonary(${key})`;
        }
        if (key in this.dictionary) {
            return this.dictionary[key];
        } else {
            return `no-value(${key})`;
        }
    }

    conjugateUANumber(conjOptions: UANumberConjugation) {
        const strGenFn = (number: number) => {
            if (number < 20) {
                if (number === 1) {
                    return conjOptions.one;
                }
                else if (number < 5) {
                    return conjOptions.upTo4;
                }
                else
                    return conjOptions.many;
            }
            else return strGenFn(number % 10);
        };
        return strGenFn
    }
}