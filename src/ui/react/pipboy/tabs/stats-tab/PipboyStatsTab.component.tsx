import React from 'react';
import { PipboyTab, PipboyTabProps } from '../../PipboyTab.interface';
import { RulerComponent } from '../../../helpers/Ruler/Ruler.component';
import { Hoverable } from '../../../helpers/Hoverable.component';
import { GameButton } from '../../../helpers/buttons/GameButton.component';
import { useHoverGroup, useInjector, useObservable, useMaybeObservabe, useMaybeRender } from '../../../helpers/Hooks.utils';
import { Perks } from '../../../../../game-logic/data/Constants.utils';
import { GamePerk, EvilGamePerk } from '../../../../../game-logic/data/GamePerk.model';
import { If } from '../../../helpers/ControlFlow.components';
import { GameStateService } from '../../../../../state/GameState.service';
import { GameStateRepository } from '../../../../../state/GameStateRepository.model';
import { compose } from '../../../../../utils/Functions.utils';

const StatsText = props => <div className='stats-text'>{props.children}</div>

const PipboyStatsTabComponent: React.FC<PipboyTabProps> = props => {

    const repository = useInjector().get(GameStateRepository);

    const [currentPerkHovered, hoverProps] = useHoverGroup<GamePerk>(null);

    const displayImage = currentPerkHovered?.imageSrc || "/text/pipboy-stats-image.png";
    const perkDescription = currentPerkHovered?.description || '';

    const CapsAmount = compose(useMaybeObservabe, useMaybeRender)(repository.playerCapsAmount);

    return (
        <div id="pipboy-stats-tab-content">
            <div id="stats-tab-xp-wrapper">
                <div className="stats-text">
                    LVL: 3, XP: 
                </div>
                <RulerComponent total={6} values={[{ value: 2, color: '#dfd' }]} globalColor='#dfd' />

                <CapsAmount>
                    {caps => (
                        <div id="stats-caps-block"><img src="text/caps_icon.png" id="pipboy-stats-caps-icon" />{caps}</div>
                    )}
                </CapsAmount>
            </div>
            <div id="stats-tab-middle-section">
                <div id="stats-tab-attribute-section">
                    <StatsText>
                        <Hoverable {...hoverProps} hoverType={EvilGamePerk}>
                            <div className="game-button">
                                Мерзенний
                            </div>
                        </Hoverable>
                    </StatsText>
                </div>
                <div id="stats-tab-class-image">
                    <img src={displayImage} />
                    <If value={false}>
                        <div className="perk-description">
                            {perkDescription}
                        </div>
                    </If>
                </div>
            </div>
            <div id="stats-tab-hp-wrapper">
                <div className="stats-text">
                    RAD/HP
                </div>
                <RulerComponent total={20} values={[{ value: 2, color: 'rgb(0, 200, 0)' }, { value: 16, color: 'rgb(200, 80, 0)' }]} globalColor='rgb(0, 200, 0)' />
            </div>
        </div>
    )
}

export const PipboyStatsTab: PipboyTab = {
    id: 'stats',
    name: 'STATS',
    component: PipboyStatsTabComponent
}