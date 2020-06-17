import { Injectable, Inject, Injector, ReflectiveInjector } from "injection-js";
import RenderDOM from 'react-dom';
import React from 'react';
import { UIContainer } from "./react/UIContainer.component";
import { Vector2 } from "three";
import { Subject } from "rxjs";
import { v4 } from 'uuid';
import { UIComponentResolver } from "./UIComponentResolver.service";
import { DependencyInjectorContext } from "./react/helpers/Hooks.utils";

export interface UIInterfaceDesc {
    type: string,
    options: any
}

export interface FloatMenuRef {
    id: string;
    items?: any[];
    radius?: number
    position?: Vector2;
}

export const PLAYER_ACTION_MENU_ITEM = 'player_action_menu_item';
export const GAME_MAP = 'map';
export const GAME_HUD = 'hud'
@Injectable()
export class UIManager {

    constructor(
        @Inject(UIComponentResolver) private uiComponentsResolver: UIComponentResolver,
        @Inject(Injector) private injector: ReflectiveInjector
    ) {

    }

    public floatMenuAddSubject = new Subject<FloatMenuRef>();
    public floatMenuRemoveSubject = new Subject<FloatMenuRef>();

    render(linker: (arg0: UIComponentResolver) => void) {
        linker(this.uiComponentsResolver);
        RenderDOM.render(
            (
                <DependencyInjectorContext.Provider value={this.injector}>
                        <UIContainer
                            uiManager={this}
                        />
                </DependencyInjectorContext.Provider>
            )
            , document.getElementById('ui'));
    }

    createFloatMenu(position: Vector2, items: UIInterfaceDesc[], radius: number, id: string = v4()): string {
        this.floatMenuAddSubject.next({ id, items: items, position, radius });
        return id;
    }

    removeFloatMenu(id: string) {
        this.floatMenuRemoveSubject.next({ id });
    }


    toReactChildren(items: UIInterfaceDesc[]): React.ReactNode {
        return items.map(({ type, options }, i) => this.factoryUIComponent(type, options, i))
    }

    factoryUIComponent(type: string, options: any, index: number) {
        return this.uiComponentsResolver.resolve(type, options)
    }

    getMap() {
        return this.uiComponentsResolver.resolve(GAME_MAP, null);
    }

    getHUD() {
        return this.uiComponentsResolver.resolve(GAME_HUD, null);
    }

}