import { Token } from "../TokenStream/Token";
import { Stream } from "../Stream.model";


type TokenStream = Stream<Token, any>;

export interface ILiteral {
    type: number
}

export type LiteralParserResult = ILiteral[] | boolean;

export type LiteralParser = (token: TokenStream) => LiteralParserResult;

export class LiteralParserRef {
    parser?: GeneralLiteralParser;
}

export type GeneralLiteralParser = LiteralParser | LiteralParserRef 


const callLiteralParser = (parser: GeneralLiteralParser) => (tokens: TokenStream): LiteralParserResult => {
    const parserRef = (parser as LiteralParserRef);
    if (parserRef.parser) {
        return callLiteralParser(parserRef.parser)(tokens)
    } else if (typeof parser === 'function') {
        return parser(tokens)
    } else {
        return false;
    }
}

export const AbstractLanguage = {
    or(...parsers: GeneralLiteralParser[]): GeneralLiteralParser {
        return (tokens: TokenStream) => {
            return parsers.reduce<LiteralParserResult>((result, parser) => {
                if(result || tokens.isEof()){
                    return result;
                }
                const cursor = tokens.getCursor();
                const orResult = callLiteralParser(parser)(tokens);
                if(!orResult) {
                    tokens.setCursor(cursor)
                }
                return result || orResult;
            }, false);
        }
    },

    and(...parsers: GeneralLiteralParser[]): GeneralLiteralParser {
        return (tokens: TokenStream) => {
            return parsers.reduce((total, parser) => {
                if(!total || tokens.isEof()){
                    return total;
                }
                const result = callLiteralParser(parser)(tokens);
                if(result === true) {
                    return total;
                } else if (result) {
                    return total.concat(result)
                } else {
                    return false;
                }
            }, []);
        }
    },

    listOf(item: GeneralLiteralParser, listRef: LiteralParserRef, allowEmpty = false) {
        if(allowEmpty) {
            return AbstractLanguage.or(AbstractLanguage.and(item, listRef),AbstractLanguage.NIL())
        } else {
            return AbstractLanguage.or(AbstractLanguage.and(item, listRef), item);
        }
    },

    ref(): LiteralParserRef {
        return {
            parser: undefined
        };
    },

    fromToken(tokenType: number, mapFn: (val: string) => ILiteral): LiteralParser {
        return (tokens: TokenStream) => {
            const tokenValue = AbstractLanguage.isToken(tokenType)(tokens);
            return tokenValue ? [mapFn(tokenValue)] : false;
        }
    },

    isToken(tokenType: number) {
        return (tokens: TokenStream) => {
            const token = tokens.peek();
            if (token.type === tokenType) {
                tokens.read();
                return token.value;
            }
            return false;
        }
    },

    requireToken(tokenType: number): GeneralLiteralParser {
        return tokens => {
            return !!AbstractLanguage.isToken(tokenType)(tokens);
        }
    },
    
    map(parser: GeneralLiteralParser, mapFn: (literals: ILiteral[]) => ILiteral): GeneralLiteralParser {
        return tokens => {
            const result = callLiteralParser(parser)(tokens);
            if(result) {
                return [mapFn(result as ILiteral[])];
            } else {
                return false;
            }
        }
    },
    
    call(parser: GeneralLiteralParser) {
        return callLiteralParser(parser);
    },

    NIL(): GeneralLiteralParser {
        return () => {
            return []
        };
    }
}