import React from 'react';
import { Weapon } from '../../../../game/active/Weapon.model';
import { ActiveCardWrapper, ActiveCardText, ActiveCardHeader, ActiveCardImage, ActiveCardStats, ActiveCardCost } from './ActiveCardWrapper.component';
import { PrimaryStatistics } from '../../../../game-logic/data/Constants.utils';

interface WeaponCardProps {
    weapon: Weapon
}

export const WeaponCard: React.FC<WeaponCardProps> = props => {
    const { weapon } = props;
    return (
        <ActiveCardWrapper>
            <ActiveCardHeader name={weapon.name} type={"ПРЕДМЕТ - ЗБРОЯ"}>
                <ActiveCardCost cost={weapon.cost} />
            </ActiveCardHeader>
            <ActiveCardImage src={weapon.image} backgroundColor="rgb(212,143,3)" />
            <ActiveCardStats>
                {weapon.abilities.map(ability => {
                    const letter = PrimaryStatistics[ability][0].toUpperCase();
                    return (
                        <div className='primary-stat-letter' key={letter}>
                            {letter}
                        </div>
                    )
                })}
                {weapon.isRanged && (<img src='/text/ranged_icon.png' className="ranged-weapon-icon" />)}
            </ActiveCardStats>
            <ActiveCardText text={weapon.description} />
        </ActiveCardWrapper>
    )
}