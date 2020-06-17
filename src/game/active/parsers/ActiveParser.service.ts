import { Injectable } from "injection-js";
import { FileLoader } from "three";
import { convertStringToTokenStream } from "../../../language/impl/TokenParsing.utils";
import { TokensList } from "../../../language/impl/Tokens.utils";
import { toSyntaxTree, executeTree } from "../../../language/impl/LiteralParsers.utils";
import { GameData } from "../../../language/impl/GameData.interface";
import { GameActive } from "../GameActive.model";
import { maybeGet } from "../../../utils/Common.utils";

export type ConcreteActiveParser = (id: string, gameData: GameData) => GameActive;


@Injectable()
export class GameActiveParser {
    private fileLoader: FileLoader = new FileLoader();

    parsers = new Map<string, ConcreteActiveParser>();

    async parse(filePath: string) {
        const content = await this.load(filePath) as string;
        const itemsStr = content.split('#').filter(x => x);
        const output: GameActive[] = [];
        let id = 0;
        for (const itemString of itemsStr) {
            const tokenStream = convertStringToTokenStream(`${itemString.trim()}`, TokensList);
            const tree = toSyntaxTree(tokenStream);
            const result = executeTree(tree);
            const type = result.get<string>('type');
            const parser = maybeGet(this.parsers, type);
            const active = parser.map(parser => parser('' + id++, result));
            active.map(active => output.push(active));
        }
        return output;
    }


    private load(filePath: string) {
        return new Promise<string | ArrayBuffer>((resolve, reject) => {
            this.fileLoader.load(filePath, resolve, null, reject);
        })
    }
}