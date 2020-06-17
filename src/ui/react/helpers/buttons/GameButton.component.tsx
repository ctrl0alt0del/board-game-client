import React from 'react';

interface GameButtonProps {
    className?: string
}

export const GameButton: React.FC<GameButtonProps> = props => {
    const { className } = props;

    const classNameStr = 'game-button '.concat(className);

    return (
        <div className={classNameStr}>
            {props.children}
        </div>
    )
}