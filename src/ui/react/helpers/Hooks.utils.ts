import { useState, createContext, useContext, useRef, useEffect, Children } from "react"
import { Type, Injector, ReflectiveInjector } from "injection-js";
import { BehaviorSubject, Subscription, combineLatest, observable, Observable } from "rxjs";
import { maybeMap, Maybe, SuperMaybe } from "../../../utils/fp/Maybe";
import { UIText, UANumberConjugation } from "../../texts/UIText.service";

export const DependencyInjectorContext = createContext<Injector>(null);

export interface HoverableProps<T> {
    onHover?: (isHovered: boolean, type: T) => void;
}

export const useHoverGroup = <T>(defaultValue: T): [T, HoverableProps<T>] => {
    const [hoverValue, setHoverValue] = useState(defaultValue);
    return [hoverValue, { onHover: (hovered, type) => hovered ? setHoverValue(type) : setHoverValue(defaultValue) }];
}

export const useHoverEffect = () => {
    const [isHovered, setHovered] = useState(false);
    return [isHovered, {onMouseEnter: ()=>setHovered(true), onMouseLeave: ()=>setHovered(false)}]
}

export const useInjector = () => useContext(DependencyInjectorContext);
export const useFactoryRef = <T>(factory: () => T) => {
    const instanceRef = useRef<T>(null);
    if (!instanceRef.current) {
        instanceRef.current = factory();
    }
    return instanceRef;
}

export const useService = <T>(ServiceClass: Type<T>): T => {
    const injector = useInjector();
    return useFactoryRef(()=>injector.get(ServiceClass)).current;
}

export const useUIManager = <T>(Class: Type<T>): T => {
    const injector: ReflectiveInjector = useInjector() as any;
    return useFactoryRef(() => injector.resolveAndInstantiate(Class)).current
};


export const useBehaviorSubject = <T>(subject: BehaviorSubject<T>, subToAdd?: Subscription): T => {
    return useObservable(subject, subject.getValue(), subToAdd)

}

export const useObservable = <T>(observable: Observable<T>, initialValue: T = undefined, subToAdd?: Subscription) => {
    const [state, setState] = useState(initialValue)
    const subscriptionRef = useFactoryRef(() => observable.subscribe(setState));
    maybeMap(subToAdd, sub => sub.add(subscriptionRef.current));
    return state;
}

export const useMaybeObservabe = <T>(observable: Observable<SuperMaybe<T>>, subToAdd?: Subscription) => {
    return Maybe.from(useObservable(observable, undefined, subToAdd));
}

export const useSubscription = (subscriptionFactoryFn?: () => Subscription) => {
    const subscriptionRef = maybeMap(subscriptionFactoryFn, useFactoryRef).orDefault(useRef(new Subscription()));
    useEffect(() => {
        return () => subscriptionRef.current.unsubscribe();
    }, []);
    return subscriptionRef.current;
}

export type MaybeRender<T> = ({ children }: { children: (t: T) => any }) => any;

export const useText = (key: string): string => {
    const uiText: UIText = useInjector().get(UIText);
    return uiText.getText(key);
}

export const useUANumberConjugation = (conjOptions: UANumberConjugation) => {
    return useInjector().get(UIText).conjugateUANumber(conjOptions)
}

export const useMaybeRender = <T>(maybe: Maybe<T>): MaybeRender<T> => {
    return ({ children }: { children: (t: T) => any }) => {
        return Maybe.from(maybe).map(value => children(value)).orDefault(null);
    }
}