import React, { } from 'react';
import './style.less';
import { ResolvedComponentProps } from '../../UIComponentResolver.service';
import { UIAnimation } from '../helpers/Animation/Animation.component';
import { CombatStartOverlayCanvas } from './canvas/CombatStartOverlayCanvas.component';
import { wait, playUIAudio } from '../../../utils/Common.utils';
import { CombatOverlayControlButtons } from './CombatOverlay.utils';
import { CombatOverlayPDA } from './CombatOverlayPDA.component';
import { useUIManager, useBehaviorSubject, useSubscription, useMaybeRender,  useMaybeObservabe, useObservable } from '../helpers/Hooks.utils';
import { CombatOverlayManager } from './CombatOverlay.manager';
import { CombatOverlayEnemyInfo } from './CombatOverlayEnemyInfo.component';
import { compose } from '../../../utils/Functions.utils';
import { CombatRollOverlay } from './CombatRollOverlay.component';

interface CombatOverlayProps extends ResolvedComponentProps {
}

export const CombatOverlay: React.FC<CombatOverlayProps> = props => {
    const { } = props;
    const overlayManager = useUIManager(CombatOverlayManager);
    const subscription = useSubscription(() => overlayManager.initializeSubscriptions());
    const combatStarted = useObservable(overlayManager.onCombatStart, false, subscription);
    const displayCombatIntro = useBehaviorSubject(overlayManager.onCombatDisplayIntro, subscription);
    const EnemyInfo = compose(useMaybeObservabe, useMaybeRender)(overlayManager.currentEnemy$);
    if (combatStarted) {
        return (
            <div id="combat-overlay">
                <div id='fight-bar-text'>"ДИКИЙ ГУЛЬ"</div>
                <div id="fight-bar-wrapper">
                    <img src="/text/combat_imgs/fight_bar_left.png" />
                    <img src="/text/combat_imgs/fight_bar_right.png" />
                </div>
                {displayCombatIntro &&
                    (<UIAnimation duration={7000} delay={0} onComplete={() => {
                        wait(700).then(() => {
                            playUIAudio('/sounds/pda_slide.mp3');
                        })
                    }}>
                        <div id="start-combat-overlay">
                            <CombatStartOverlayCanvas />
                        </div>
                    </UIAnimation>)
                }
                <CombatOverlayPDA
                    onButtonClick={type => {
                        if (type === CombatOverlayControlButtons.ThrowDice) {
                            overlayManager.handleThrowDice();
                        }
                    }}
                />
                <EnemyInfo>
                    {enemy => <CombatOverlayEnemyInfo enemy={enemy} />}
                </EnemyInfo>
                <CombatRollOverlay />
            </div>
        )
    } else {
        return null;
    }
}