import React from 'react';
import './styles.css';
import { PlayerActionType } from '../../../game/player/Player.service';

interface PlayerActionMenuItemProps {
    action: PlayerActionType,
    onClick?: React.EventHandler<React.MouseEvent>
}

const getIconClassForAction = (act: PlayerActionType) => {
    switch (act) {
        case PlayerActionType.Walk:
            return 'fas fa-hiking';
        case PlayerActionType.Sleep: 
            return 'fas fa-campground';
        case PlayerActionType.Scaut:
            return 'fab fa-wpexplorer';
        case PlayerActionType.Quest:
            return 'fas fa-certificate';
        case PlayerActionType.Fight:
            return 'fas fa-skull-crossbones';
        case PlayerActionType.Encount:
            return 'fas fa-city';
    }
}

export const PlayerActionMenuItem: React.FC<PlayerActionMenuItemProps> = props => {
    const { action, onClick } = props;
    const iconClass = getIconClassForAction(action);
    return (
        <div className="player-action-menu-item" onClick={e => onClick && onClick(e)}>
            <i className={iconClass} />
        </div>
    )
}