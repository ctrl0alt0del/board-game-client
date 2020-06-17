import { Injectable, Inject, InjectionToken, Injector } from "injection-js";
import React from 'react';

export const UIEventHandler = new InjectionToken('ui_event_handler');

type UILinkPropsResolveFunction<Props> = (arg0: Injector, props: Partial<Props>) => Partial<Props>;

type UILinkedNode<Props extends ResolvedComponentProps = any> = { fn: React.ComponentType<Props>, propsFn: UILinkPropsResolveFunction<Props> }

export interface ResolvedComponentProps {
    uiResolver: UIComponentResolver
}

@Injectable()
export class UIComponentResolver {

    private linkedComponents = new Map<string, UILinkedNode>();

    constructor(
        @Inject(Injector) private injector: Injector
    ) {

    }

    linkComponent<Props>(type: string, component: React.ComponentType<Props>, propsResolver?: UILinkPropsResolveFunction<Props>) {
        this.linkedComponents.set(type, { fn: component, propsFn: propsResolver })
    }

    resolve<T extends ResolvedComponentProps>(type: string, initialProps?: Partial<T>) {
        if (this.linkedComponents.has(type)) {
            const { fn: Class, propsFn } = this.linkedComponents.get(type) as UILinkedNode<T>;
            const props = Object.assign({ uiResolver: this } as ResolvedComponentProps, initialProps ? initialProps : {}, propsFn ? propsFn(this.injector, initialProps) : {}) as T;
            return <Class {...props} />
        }
        return null;
    }
}