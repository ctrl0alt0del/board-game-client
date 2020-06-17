import { TokenStream } from "../TokenStream/TokenStream";
import { TokenType } from "./TokenType.enum";
import { AbstractLanguage, ILiteral, LiteralParserResult } from "../LanguageTreeBuilder/LanguageTreeBuilder.model";
import { Stream } from "../Stream.model";
import { Token } from "../TokenStream/Token";
import { KeyValuePair, GameData } from "./GameData.interface";
import { GameLogicFunction, GameLogicTerm, GameLogicConstant, GameValue } from "../../game-logic/game-state-machine/GameTerms";

export enum LiteralType {
    WordLiteral,
    StringLiteral,
    AssignStatementLiteral,
    BlockLiteral,
    FunctionCall,
    NumberLiteral,
    ArgsListLiteral,
    FunctionCallList
}

interface IControlLiteral<T = any> extends ILiteral {
    execute(): T;
}

interface TokenLiteral extends ILiteral {
    value: string;
}

interface NumberLiteral extends IControlLiteral<GameValue> {
    value: number
}

interface IAssignLiteral extends IControlLiteral<KeyValuePair<any>> {
    left: ILiteral,
    right: ILiteral
}

interface IFunctionCallLiteral extends IControlLiteral<GameLogicFunction> {
    name: string;
    args: IArgListLiteral
}

interface IListOfLiteral<T, K> extends IControlLiteral<K> {
    items: T[]
}

interface IArgListLiteral extends IListOfLiteral<ILiteral, GameLogicTerm[]> {
}

const executeLiteral = (literal: TokenLiteral | IControlLiteral, mapValue? : (val: string) => any) => {
    return ('execute' in literal) ? literal.execute() : (mapValue ? mapValue(literal.value) : literal.value);
}

type ListMaper<T, K> = (arg: [T, IListOfLiteral<T, K>]) => IListOfLiteral<T, K>;

const toAssignLiteral = ([leftSideLiteral, rightSideLiteral]: [TokenLiteral, (TokenLiteral|IControlLiteral)]): IAssignLiteral => ({
    type: LiteralType.AssignStatementLiteral,
    left: leftSideLiteral,
    right: rightSideLiteral,
    execute() {
        const value = executeLiteral(rightSideLiteral);
        const key = leftSideLiteral.value;
        return {key, value} 
    }
});

const toFunctionCallLiteral = ([nameLiteral, argList]: [TokenLiteral, IArgListLiteral]): IFunctionCallLiteral => {
    return {
        type: LiteralType.FunctionCall,
        name: nameLiteral.value,
        args: argList,
        execute() {
            const argsResult = argList.execute();
            return {
                args: argsResult,
                name: nameLiteral.value
            }
        }
    };
};

const toList = <T, K>([head, tail]: [T, IListOfLiteral<T, K>]): T[] => {
    return tail ? [head].concat(tail.items.filter(x => !!x)) : [head]
}


const toBlockLiteral: ListMaper<IAssignLiteral, GameData> = (arg) => {
    return {
        type: LiteralType.BlockLiteral,
        items: toList(arg),
        execute() {
            return arg[1] ? arg[1].execute().add(arg[0].execute()) : new GameData().add(arg[0].execute())
        }
    }
};

const toArgumentList: ListMaper<TokenLiteral, GameLogicTerm[]> = (arg) => {
    return {
        type: LiteralType.ArgsListLiteral,
        items: toList(arg),
        execute(){
            const initial = arg[0] ? [executeLiteral(arg[0], val => ({name: val})) as GameLogicTerm]: [];
            return arg[1] ? initial.concat(arg[1].execute()) : initial
        }

    }
}

const toFunctionCallList: ListMaper<IFunctionCallLiteral, GameLogicFunction[]> = arg => {
    return {
        type: LiteralType.FunctionCallList,
        items: toList(arg),
        execute(){
            const initial = [arg[0].execute()];
            return arg[1] ? initial.concat(arg[1].execute()) : initial;
        }
    }
}

const AL = AbstractLanguage;

const Word = AL.fromToken(TokenType.Word, (name) => {
    return {
        type: LiteralType.WordLiteral,
        value: name
    }
});
const Number = AL.fromToken(TokenType.Number, (valueStr) => {
    return {
        type: LiteralType.NumberLiteral,
        value: parseFloat(valueStr),
        execute() {
            return {
                value: parseFloat(valueStr)
            }
        }
    }
});

const StringLiteral = AL.fromToken(TokenType.String, str => {
    return {
        type: LiteralType.StringLiteral,
        value: str,
        execute() {
            return str.replace(/\"/g, '')
        }
    }
})

const OPEN_PAREN = AL.requireToken(TokenType.OpenParen);
const CLOSE_PAREN = AL.requireToken(TokenType.CloseParen);
const OPEN_CURLY_BRACKET = AL.requireToken(TokenType.OpenCurlyBracket);
const CLOSE_CURLY_BRACKET = AL.requireToken(TokenType.CloseCurlyBracket);
const EQUALITY_SIGN = AL.requireToken(TokenType.EqualitySign);

const BlockLiteral = AL.ref();
const FunctionCall = AL.ref();
const FunctionCallList = AL.ref();
const FunctionArgumentList = AL.ref();

const FunctionArgument = AL.or(FunctionCall, Word, Number);
const BlockWrap = AL.and(OPEN_CURLY_BRACKET, BlockLiteral, CLOSE_CURLY_BRACKET)
const Assignable = AL.or(FunctionCallList, Word, StringLiteral, Number, BlockWrap);
const FunctionCallStructure = AL.and(Word, OPEN_PAREN, FunctionArgumentList, CLOSE_PAREN);
const AssignStatementStructure = AL.and(Word, EQUALITY_SIGN, Assignable);
const AssignStatementLiteral = AL.map(AssignStatementStructure, toAssignLiteral);
const BlockStructure = AL.listOf(AssignStatementLiteral, BlockLiteral);
const FunctionArgumentListStructure = AL.listOf(FunctionArgument, FunctionArgumentList, true);
const FunctionCallListStructure = AL.listOf(FunctionCall, FunctionCallList);

FunctionArgumentList.parser = AL.map(FunctionArgumentListStructure, toArgumentList);
FunctionCall.parser = AL.map(FunctionCallStructure, toFunctionCallLiteral);
FunctionCallList.parser = AL.map(FunctionCallListStructure, toFunctionCallList);
BlockLiteral.parser = AL.map(BlockStructure, toBlockLiteral);

export const toSyntaxTree = (tokens: Stream<Token>) => {
    return AL.call(BlockLiteral)(tokens)
}

export const executeTree = (tree: LiteralParserResult) => {
    if(!(typeof tree === 'boolean') && (tree instanceof Array)) {
        return (tree[0] as IListOfLiteral<IAssignLiteral, GameData>).execute();
    }
}