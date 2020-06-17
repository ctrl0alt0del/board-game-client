import React from 'react';
import { CombatOverlayControlButtons, getCombatOverlayButtonText } from './CombatOverlay.utils';
import { HoverableProps } from '../helpers/Hooks.utils';

interface CombatOverlayButtonProps extends HoverableProps<CombatOverlayControlButtons> {
    type: CombatOverlayControlButtons,
    onClick?: ()=>void
}

export const CombatOverlayButton: React.FC<CombatOverlayButtonProps> = props => {
    const { type, onHover, onClick } = props;
    return (
        <div
            className="combat-button"
            onMouseEnter={() => onHover && onHover(true, type)}
            onMouseLeave={() => onHover && onHover(false, type)}
            onClick={()=>onClick && onClick()}
        >
            {getCombatOverlayButtonText(type)}
        </div>
    )
}