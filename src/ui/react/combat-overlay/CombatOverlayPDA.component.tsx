import React from 'react';
import { CombatOverlayButton } from './CombatOverlayButton.component';
import { CombatOverlayControlButtons, CombatOvelayText } from './CombatOverlay.utils';
import { useHoverGroup } from '../helpers/Hooks.utils';
import { CombatOverlayExplanationLayout } from './CombatOverlayExplanationLayout.component';

const PDARightSideContent: { [key in CombatOverlayControlButtons]?: JSX.Element } = {
    [CombatOverlayControlButtons.None]: <CombatOverlayExplanationLayout title={CombatOvelayText.INITIAL_TITLE_TEXT} text={CombatOvelayText.INITIAL_EXPL_TEXT} imageSrc="/text/fallout_boy/Combat_shotgun_icon.png" />,
    [CombatOverlayControlButtons.ThrowDice]: <CombatOverlayExplanationLayout title={CombatOvelayText.THROW_DICE_TITLE_TEXT} text={CombatOvelayText.THROW_DICE_EXPL_TEXT} imageSrc="/text/fallout_boy/gambling_icon.png" />,
    [CombatOverlayControlButtons.RerollDice]: <CombatOverlayExplanationLayout title={CombatOvelayText.REROLL_TITLE_TEXT} text={CombatOvelayText.REROLL_EXPL_TEXT} imageSrc="/text/fallout_boy/professional.png" />,
    [CombatOverlayControlButtons.AcceptResult]: <CombatOverlayExplanationLayout title={CombatOvelayText.ACCEPT_RESULT_TITLE} text={CombatOvelayText.ACCEPT_RESULT_EXPL_TEXT} imageSrc="/text/fallout_boy/end_fight.png" />

}

interface CombatOverlayPDAProps {
    onButtonClick?: (buttonType: CombatOverlayControlButtons) => void;
}

export const CombatOverlayPDA: React.FC<CombatOverlayPDAProps> = props => {
    const { onButtonClick } = props;
    const [hoveredButtonType, hoverProps] = useHoverGroup(CombatOverlayControlButtons.None);
    return (
        <div id="combat-buttons-wrapper">
            <div id="combat-buttons-wrapper-background" />
            <div id="combat-pda-content">
                <div id="combat-pda-left-side">
                    <CombatOverlayButton
                        type={CombatOverlayControlButtons.ThrowDice} {...hoverProps}
                        onClick={() => onButtonClick && onButtonClick(CombatOverlayControlButtons.ThrowDice)}
                    />
                    <CombatOverlayButton type={CombatOverlayControlButtons.RerollDice} {...hoverProps} />
                    <CombatOverlayButton type={CombatOverlayControlButtons.AcceptResult} {...hoverProps} />
                </div>
                <div id="combat-pda-right-side">
                    {PDARightSideContent[hoveredButtonType]}
                </div>
            </div>
        </div>
    )
}