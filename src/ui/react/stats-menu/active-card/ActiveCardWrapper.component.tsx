import React from 'react';

interface ActiveCardTextProps {
    text: string
}

interface ActiveCardHeaderProps {
    name: string;
    type: string;
}

interface ActiveCardImageProps {
    src: string;
    backgroundColor: string;
}

interface ActiveCardCostProps {
    cost: number
}

export const ActiveCardWrapper: React.FC = props => {
    const { children } = props;
    return (
        <div className='active-card-wrapper'>
            {children}
        </div>
    )
}


export const ActiveCardText: React.FC<ActiveCardTextProps> = props => {
    const { text, children } = props;
    return (
        <div className="active-card-text-container">
            {text}
        </div>
    )
}

export const ActiveCardHeader: React.FC<ActiveCardHeaderProps> = props => {
    const { name, type, children } = props;
    return (
        <div className="active-card-header-container">
            <div className="active-card-header-line title">
                {name}
            </div>
            <div className="active-card-header-line">
                {type}
            </div>
            {children}
        </div>
    )
}

export const ActiveCardImage: React.FC<ActiveCardImageProps> = props => {
    const { src, backgroundColor } = props;
    return (
        <div className='active-card-image-container' style={{ backgroundColor }}>
            <div className='active-card-image-background' />
            <img src={src} className="item-image" />
        </div>
    )
}

export const ActiveCardStats: React.FC = props => {
    const { children } = props;
    return (
        <div className='active-card-stats-container'>
            {children}
        </div>
    )
}

export const ActiveCardCost: React.FC<ActiveCardCostProps> = props => {
    const { cost } = props;
    return (
        <div className="active-card-header-cost">
            {cost}
        </div>
    )
}