import { ComponentType } from "react";
import { UIComponentResolver } from "../../UIComponentResolver.service";

export interface PipboyTabProps {
    uiResolver: UIComponentResolver;
}

export interface PipboyTab {
    name: string;
    id: string;
    component: ComponentType<PipboyTabProps>
}