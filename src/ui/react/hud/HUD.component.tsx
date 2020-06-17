import React, { useEffect, useState } from 'react';
import { ResolvedComponentProps } from '../../UIComponentResolver.service';
import { FalloutGameUITypes as FalloutGameUITypes } from '../../../AppConstants';
import './style.less'
import { DynamicPosition } from '../helpers/DynamicPosition/DynamicPosition.component';
import { BehaviorSubject } from 'rxjs';
import { Vector2 } from 'three';
import { getUIHUDTransform, initialHUDSize } from './HUD.utils';
import { FPSCounter } from './fps-counter/FPSCounter.component';
import { RequestCapsDialog } from '../dialogs/RequestCapsDialog.component';

interface HUDComponentProps extends ResolvedComponentProps {
    frameRateSubject: BehaviorSubject<number>
}


export const HUDComponent: React.FC<HUDComponentProps> = props => {

    const { uiResolver, frameRateSubject } = props;
    const [transform, setTransform] = useState({ scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 });
    useEffect(() => {
        setTransform(getUIHUDTransform());
        window.addEventListener('resize', () => {
            setTransform(getUIHUDTransform())
        })
    }, [])
    return (
        <React.Fragment>
            <div id="hud" style={{ transform: `scale(${transform.scaleX}, ${transform.scaleY}) translate(${transform.translateX}px, ${transform.translateY}px)`, ...initialHUDSize }}>
                <FPSCounter frameRateSubject={frameRateSubject}/>
                {uiResolver.resolve(FalloutGameUITypes.COMBAT_OVERLAY)}
                <div id="hud-bottom-panel">
                    <div id="pipboy-container">
                        {uiResolver.resolve(FalloutGameUITypes.PIPBOY)}
                    </div>
                    <div id="stats_menu_wrapper">
                        {uiResolver.resolve(FalloutGameUITypes.STATS_MENU)}
                    </div>
                </div>
            </div>
            <RequestCapsDialog/>
        </React.Fragment>
    )
}