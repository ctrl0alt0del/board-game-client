import { Type } from "injection-js";
import 'reflect-metadata';
import { GameObject } from "../GameObject.model";
import { SelectStrategy } from "./SelectStrategy.model";

const SelectStrategyType = 'design:select_Strategy_type';

export function getSelectableStrategy<T extends GameObject>(obj: T): SelectStrategy | null {
    const type: Type<SelectStrategy<T>> = Reflect.getMetadata(SelectStrategyType, obj.constructor);
    if(type) {
        return new type(obj);
    } else {
        return null;
    }
}

export function SelectableGameObject(StrategyType: Type): ClassDecorator {
    return Reflect.metadata(SelectStrategyType, StrategyType);
}