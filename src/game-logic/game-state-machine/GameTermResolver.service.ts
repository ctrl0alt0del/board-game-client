import { Injectable, Injector, Inject } from "injection-js";
import { GameLogicFunction, GameLogicConstant, GameLogicTerm, GameValue } from "./GameTerms";
import { Maybe } from "../../utils/fp/Maybe";
import { MapFunction, IdentityFunction } from "../../utils/Functions.utils";
import { GameEffectOperation, GameEffectOperationType } from "../effects/GameEffect.model";
import { PureReader } from "../../utils/fp/Reader";
import { Lens, LensUtils } from "../../utils/lens/StateLens.utils";
import { GameTermContext } from "./GameTermContext.interface";

export type GameEngineFunction<T = any> = (...args: (string | number | MapFunction<any, any>)[]) => PureReader<Injector, T>

@Injectable()
export class GameTermResolver {

    functions = new Map<string, GameEngineFunction<any>>();

    constructor(@Inject(Injector) private injector: Injector) {

    }

    compileConstant(constant: GameLogicConstant) {
        return constant.name;
    }

    compileValue(value: GameValue) {
        return value.value;
    }

    compileFunction<T>(fun: GameLogicFunction, context: GameTermContext): Maybe<T>{
        return this.executeFunction<T>(fun.name, fun.args, context);
    }

    compilePromiseFunction<T>(fun: GameLogicFunction, context: GameTermContext): Maybe<Promise<T>>{
        return this.executeFunction(fun.name, fun.args, context);
    }

    compileOperation(op: GameLogicFunction, context: GameTermContext): GameEffectOperation {
        return this.executeFunction<GameEffectOperation>(op.name, op.args, context).orDefault({
            function: IdentityFunction,
            operation: GameEffectOperationType.NONE,
            value: 0
        })
    }

    compile(term: GameLogicTerm, context: GameTermContext): string | number | Maybe<any> {
        const func = term as GameLogicFunction, constant = term as GameLogicConstant, value = term as GameValue;
        if (func.args) {
            return this.compileFunction(func, context)
        } else if (constant.name) {
            return this.compileConstant(constant)
        } else if (value.value !== undefined) {
            return this.compileValue(value)
        }
    }

    isEqual<T>(constant: GameLogicConstant, value: T) {
        const {name} = constant;
        if(name === 'TRUE') {
            return !!value;
        } else if(name === 'FALSE') {
            return !value;
        } 
    }

    private executeFunction<T>(name: string, args: GameLogicTerm[], context: GameTermContext): Maybe<T> {
        const compiledArgs = Maybe.all(args.map(arg => Maybe.from(this.compile(arg, context))));
        const fun = Maybe.from(this.functions.get(name));
        return compiledArgs.map(_args => fun.map(_function => _function.apply(context, _args)(this.injector))).flatten();
    }
}

const GameEngineFunctionsMapLens = LensUtils.compose(LensUtils.injector(GameTermResolver), LensUtils.key('functions'));

export const getGameEngineFunctionLens = (name: string) => {
    const dictLens = LensUtils.dictionary<string, GameEngineFunction>(name);
    return LensUtils.withReader(LensUtils.compose(GameEngineFunctionsMapLens, dictLens))
}

export const registerGameFunction = (fn: GameEngineFunction<any>) => {
    const readerLen = getGameEngineFunctionLens(fn.name);
    return readerLen.set(fn)
}

export const registerMultipleGameFunctions = (fn: GameEngineFunction[]): PureReader<Injector, void> => {
    return (injector) => fn.map(f => registerGameFunction(f)(injector))
}