import React from 'react';
import './style.less';
import { ResolvedComponentProps } from '../../UIComponentResolver.service';
import { PrimaryStatistics, PrimaryStatisticsArray } from '../../../game-logic/data/Constants.utils';
import { useUIManager, useObservable, useMaybeRender } from '../helpers/Hooks.utils';
import { StatsMenuManager } from './StatsMenu.manager';
import { WeaponInfo } from './WeaponInfo.component';

interface StatsCircleProps {
    statType: PrimaryStatistics,
    shift: string
    isActive?: boolean
}

const StatsCircle: React.FC<StatsCircleProps> = props => {
    const { statType, shift, isActive } = props;
    const letter = PrimaryStatistics[statType][0].toUpperCase();
    return (
        <div className="stat-wrapper" style={{ right: shift }}>
            <div className={"stat-circle" + (isActive ? ' active' : '')} >
                {letter}
            </div>
        </div>
    )
}

interface StatsMenuProps extends ResolvedComponentProps {

}

export const StatsMenu: React.FC<StatsMenuProps> = props => {
    const statsArray = PrimaryStatisticsArray;
    const availblePoints = 4;
    const totalPoints = 6; //move to constants
    const range = new Array(totalPoints).fill(0).map((_, i) => i);
    const manager = useUIManager(StatsMenuManager);
    const playerStats = useObservable(manager.playerStats, []);
    return (
        <React.Fragment>
            <div id="perks_wrapper_overlay">
                <div id="action_point_wrapper">
                    {range.map(index => {
                        return <div className={'action-point-light' + (index < availblePoints ? ' active' : '')} />
                    })}
                </div>
                <div id="stats-line">
                    {statsArray.map((stat, i) => <StatsCircle key={stat} statType={stat} isActive={playerStats.includes(stat)} shift={`${(6 - i) * 15}%`} />)}
                </div>
                <div id="companion-viewer-wrapper">

                </div>
                <div id="menu-button-wrapper">
                </div>
                <div id="equiped-weapon-wrapper">
                    <WeaponInfo weaponObservable={manager.equipedWeapon}/>
                </div>
                <img src="text/stats_menu_overlay.png" className="overlay-image" />
            </div>
        </React.Fragment>
    )
}