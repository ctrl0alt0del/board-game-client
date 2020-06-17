import { InputStream } from "../InputStream/InputStream";
import { Token } from "./Token";
import { TokenParser } from "./Parsers/TokenParser";
import { Nullable } from "../../utils/fp/Maybe";
import { Stream } from "../Stream.model";
import { StreamOperator } from "../Stream.utils";
import { InputStreamCursor } from "../InputStream/InputStreamCursor";
import { Char } from "../InputStream/Char";

export class TokenStream extends StreamOperator<Char, InputStreamCursor, Token> {
    private tokenParsers: TokenParser[] = [];
    addTokenParser(...args: TokenParser[]) {
        this.tokenParsers.push(...args);
    }
    read(): Nullable<Token> {
        if (this.stream.isEof()) {
            return null;
        }
        this.stream.readWhile(c => c.isWhitespace() || c.isEmpty());
        let token: Token | false | undefined = undefined;
        let currentParserIndex = 0;
        while (!token && currentParserIndex < this.tokenParsers.length) {
            const parser = this.tokenParsers[currentParserIndex++];
            token = parser(this.stream);
        }
        if (token) {
        }
        else {
            const cursor = this.stream.getCursor();
            throw `Unknown token "${this.stream.peek()}" at line ${cursor.line}, column ${cursor.column}`;
        }
        return token;
    }

    clone() {
        const clone = new TokenStream(this.stream.clone());
        clone.addTokenParser(...this.tokenParsers)
        return clone;
    }

    *getIterator() {
        let token = this.read();
        while(token) {
            yield token;
            token = this.read();
        }
    }
}
