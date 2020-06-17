import React from 'react';

interface CombatOverlayExplanationLayoutProps {
    title: JSX.Element | string,
    text: JSX.Element| string,
    imageSrc: string,
    children?: void
}

export const CombatOverlayExplanationLayout: React.FC<CombatOverlayExplanationLayoutProps> = props => {
    const { imageSrc, text, title } = props;
    return (
        <React.Fragment>
            <div id="combat-pda-right-side-title">{title}</div>
            <div id="combat-pad-right-side-body">
                <div>{text}</div>
                <img src={imageSrc} className='main-image' />
            </div>
        </React.Fragment>
    )
}