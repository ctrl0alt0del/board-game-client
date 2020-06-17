import React from 'react';
import { Vector2 } from 'three';
import "./styles.css"

interface DynamicPositionProps {
    point: Vector2;
}

export const DynamicPosition: React.FC<DynamicPositionProps> = props => {
    const {point, children} = props;
    return (
        <div className="dynamic-position-wrapper" style={{top: point.y, left: point.x}}>
            {children}
        </div>
    )
}