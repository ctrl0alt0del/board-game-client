import React, { useState } from 'react';
import { ResolvedComponentProps } from '../../UIComponentResolver.service';
import './style.less';
import { GAME_MAP } from '../../UIManager.service';
import { PipboyMapTab } from './tabs/PipboyMapTab.component';
import { Maybe } from '../../../utils/fp/Maybe';
import { useMaybeRender } from '../helpers/Hooks.utils';
import { PipboyStatsTab } from './tabs/stats-tab/PipboyStatsTab.component';
interface PipboyTabProps {
    text: string,
    highlighted: boolean,
    onClick?: () => void
}
const PipboyTab: React.FC<PipboyTabProps> = props => {
    const { text, highlighted, onClick } = props;
    return (
        <div className={"pipboy-tab" + (highlighted ? ' highlighted' : '')} onClick={onClick}>
            {text}
        </div>
    )
}

enum PipboyTabType {
    STATS,
    INV,
    PERKS,
    QUEST,
    MAP
}

interface PipboyComponentProps extends ResolvedComponentProps {

}

const AvailableTabs = [
    PipboyStatsTab,
    PipboyMapTab
]

export const PipboyComponent: React.FC<PipboyComponentProps> = props => {
    const { uiResolver } = props;
    const [currentTabId, setCurrentTabId] = useState(AvailableTabs[0].id);
    const CurrentTabData = useMaybeRender(Maybe.findInArray(AvailableTabs, tab => tab.id === currentTabId))
    return (
        <div id="pipboy_wrapper">
            <div id="pipboy-content">
                <div id="current-pipboy-tab-wrapper">
                    <CurrentTabData>
                        {tab => <tab.component uiResolver={uiResolver}/>}
                    </CurrentTabData>
                </div>
                <div id="pipboy-tabs-line">
                    {AvailableTabs.map(tab => {
                        return (<PipboyTab highlighted={currentTabId === tab.id} key={tab.id} text={tab.name} onClick={()=>setCurrentTabId(tab.id)}/>)
                    })}
                </div>
            </div>
            <div id="pipboy-overlay-front" className='overlay'>
                <img src="text/pipboy_overlay.png" />
            </div>
        </div>
    )
}