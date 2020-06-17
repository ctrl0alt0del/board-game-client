import React from 'react';
import { DynamicPosition } from '../../helpers/DynamicPosition/DynamicPosition.component';
import { BehaviorSubject } from 'rxjs';
import { Vector2 } from 'three';
import { useBehaviorSubject } from '../../helpers/Hooks.utils';

interface FPSCounterProps {
    frameRateSubject: BehaviorSubject<number>
}

export const FPSCounter: React.FC<FPSCounterProps> = props => {
    const fps = useBehaviorSubject(props.frameRateSubject);
    return <DynamicPosition point={new Vector2(100, 50)}><div id="fps-counter">FPS: {fps}</div></DynamicPosition>;
}