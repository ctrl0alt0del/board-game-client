import { Injectable, Inject, Injector } from "injection-js";
import { GameObject } from "../game-object/GameObject.model";
import { GameObjectInteractor } from "./GameObjectInteractor.model";
import { InteractorBase } from "./InteractorBase.model";

@Injectable()
export class InteractorsService {

    constructor(@Inject(Injector) private injector: Injector) {

    }

    private interactors = new Map<string, InteractorBase>();

    register<T extends InteractorBase>(key: string, interactor: T) {
        interactor.useInjector(this.injector);
        this.interactors.set(key, interactor);
    }
    get<T extends InteractorBase>(key: string){
        return this.interactors.get(key) as T;
    }

    getInteractorForGameObject<T extends GameObject>(object: T): GameObjectInteractor<T> {
        const interactors = this.interactors.values();
        for(const interactor of interactors) {
            if(interactor instanceof GameObjectInteractor && interactor.gameObject === object) {
                return interactor;
            }
        }
    }
}