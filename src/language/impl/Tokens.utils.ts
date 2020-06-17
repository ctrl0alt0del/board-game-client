import { Char } from "../InputStream/Char";
import { InputStream } from "../InputStream/InputStream";
import { TokenType } from "./TokenType.enum";
import { TokenParser } from "../TokenStream/Parsers/TokenParser";

const SymbolToken = (type: TokenType, predicate: (c: Char) => boolean) => {
    return (input: InputStream) => {
        const char = input.peek();
        if (predicate(char)) {
            input.read();
            return {
                type: type,
                value: Char.makeString(char)
            }
        }
    }
}


export const IndefinierParser = (inputStream: InputStream) => {
    const char = inputStream.peek();
    if (char.isIdSymbol()) {
        const result = inputStream.readWhile(c => c.isIdSymbol() || c.isDigit() || c.isSymbol('_'));
        return {
            type: TokenType.Word,
            value: Char.makeString(...result)
        };
    }
    else {
        return false;
    }
}

export const StringParser = (input: InputStream) => {
    const char = input.peek();
    if(char.isSymbol('"')) {
        input.read();
        const result = input.readWhile(c => !c.isSymbol('"'));
        input.read();
        return {
            type: TokenType.String,
            value: '"'+Char.makeString(...result)+'"'
        }
    }
}


export const NumberParser = (inputStream: InputStream) => {
    const char = inputStream.peek();
    if (char.isDigit() || char.isMantisaSeperator()) {
        let delimeterFlag = false;
        const result = inputStream.readWhile(c => {
            if (c.isDigit()) {
                return true;
            }
            else if (c.isMantisaSeperator()) {
                const orignalDelimeterFlag = delimeterFlag;
                delimeterFlag = true;
                return !orignalDelimeterFlag;
            }
            else {
                return false;
            }
        });
        return {
            type: TokenType.Number,
            value: Char.makeString(...result)
        };
    }
    else {
        return false;
    }
}

export const OpenCurlyBraket = SymbolToken(TokenType.OpenCurlyBracket, char => char.isSymbol('{'));
export const CloseCurlyBraket = SymbolToken(TokenType.CloseCurlyBracket, char => char.isSymbol('}'));
export const EqualitySignToken = SymbolToken(TokenType.EqualitySign, char => char.isSymbol('='));
export const NewLineToken = SymbolToken(TokenType.NewLine, char => char.isNewLine());
export const OpenParenToken = SymbolToken(TokenType.OpenParen, char => char.isSymbol('('));
export const CloseParenToken = SymbolToken(TokenType.CloseParen, char => char.isSymbol(')'))


export const TokensList: TokenParser[] = [IndefinierParser, StringParser, NumberParser, OpenCurlyBraket, CloseCurlyBraket, EqualitySignToken, NewLineToken, OpenParenToken, CloseParenToken];
