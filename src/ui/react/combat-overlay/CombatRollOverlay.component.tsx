import React from 'react';
import { rerollsCount } from '../../../game-logic/CalcualtionBreakdown.utils';
import { useService, useInjector, useObservable } from '../helpers/Hooks.utils';
import { CalculationBreakdownComponent } from '../calculation-breakdown/CalculationBreakdown.component';
import { PlayerService } from '../../../game/player/Player.service';
import { If } from '../helpers/ControlFlow.components';

interface CombatRollOverlayProps {

}

export const CombatRollOverlay: React.FC<CombatRollOverlayProps> = props => {
    const { } = props;
    const rerolls = useObservable(rerollsCount.resolve([useInjector()].concat(useService(PlayerService).player.id as any) as any), null);
    return (
        <div id="combat-roll-overlay-container">
            <If value={!!rerolls}>
                <div id="combat-rerolls-count-wrapper">
                    Залишилось спроб перекинути кубики: <CalculationBreakdownComponent calculation={rerolls} />
                </div>
            </If>
        </div>
    )
}