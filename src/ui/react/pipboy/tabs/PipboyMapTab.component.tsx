import React from 'react';
import { PipboyTab } from '../PipboyTab.interface';
import { GAME_MAP } from '../../../UIManager.service';

export const PipboyMapTab: PipboyTab = {
    name: 'MAP',
    id: 'map',
    component: ({ uiResolver }) => {
        return (
            <div id="map-wrapper">
                {uiResolver.resolve(GAME_MAP)}
            </div>
        )
    }
}