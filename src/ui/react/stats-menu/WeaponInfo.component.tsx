import React from 'react';
import { Observable } from 'rxjs';
import { Weapon } from '../../../game/active/Weapon.model';
import { useObservable, useMaybeRender, useHoverEffect } from '../helpers/Hooks.utils';
import { Maybe } from '../../../utils/fp/Maybe';
import { WeaponCard } from './active-card/WeaponCard.component';

interface WeaponInfoProps {
    weaponObservable: Observable<Maybe<Weapon>>
}

export const WeaponInfo: React.FC<WeaponInfoProps> = props => {
    const { weaponObservable } = props;

    const equipedWeapon = useObservable(weaponObservable);
    const EquipedWeaponInfo = useMaybeRender(equipedWeapon);
    const [isHovered, hoverProps] = useHoverEffect();
    return (
        <EquipedWeaponInfo>
            {weapon => (
                <React.Fragment>
                    <img src={weapon.image} className='item-image' {...hoverProps} />
                    {isHovered && <WeaponCard weapon={weapon}/>}
                </React.Fragment>
            )}
        </EquipedWeaponInfo>
    )
}