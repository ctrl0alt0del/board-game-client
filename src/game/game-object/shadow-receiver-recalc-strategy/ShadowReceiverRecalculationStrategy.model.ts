import { GameObject } from "../GameObject.model";

export abstract class ShadowReceiverRecalcStrategy {
    abstract shouldReceiveShadow(gameObject: GameObject): boolean;
}