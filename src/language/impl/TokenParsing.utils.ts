import { TokenParser } from "../TokenStream/Parsers/TokenParser";
import { CodeString } from "../InputStream/CodeString";
import { InputStream } from "../InputStream/InputStream";
import { TokenStream } from "../TokenStream/TokenStream";
import { filterStream } from "../Stream.utils";
import { Char } from "../InputStream/Char";

export const convertStringToTokenStream = (input: string, parsers: TokenParser[]) => {
    const code = new CodeString(input);
    const inputStream = new InputStream(code);
    const tokenStream = new TokenStream(inputStream);
    tokenStream.addTokenParser(...parsers);
    return filterStream(tokenStream, token => !new Char(token.value).isNewLine());
}