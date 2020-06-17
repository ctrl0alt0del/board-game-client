import React from 'react';
import { DynamicPosition } from '../helpers/DynamicPosition/DynamicPosition.component';
import { Vector2 } from 'three';
import { UILayout } from '../layouts/UILayout.model';
import "./styles.css";

interface FloatMenuProps {
    position: Vector2,
    children: React.ReactNode,
    layout: UILayout
}

export const FloatMenu: React.FC<FloatMenuProps> = props => {
    const { position, layout, children } = props;
    if (position) {
        return (
            <DynamicPosition point={position}>
                <div className="float-menu">
                    {React.Children.map(children, (item, index) => {
                        const { x, y } = layout.getCoords(index)
                        return (
                            <div className='float-menu-item' style={{ bottom: y, left: x }} key={index}>
                                {item}
                            </div>
                        )
                    })}</div>
            </DynamicPosition>
        )
    } else {
        return null;
    }
}