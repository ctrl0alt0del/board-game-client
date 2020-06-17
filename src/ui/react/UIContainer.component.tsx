import React, { useState, useEffect } from 'react';
import "./global.styles.css";
import { Observable } from 'rxjs';
import { FloatMenuRef, UIManager } from '../UIManager.service';
import { FloatMenu } from './float-menu/FloatMenu.component';
import { CircleAroundLayout } from './layouts/CircleAroundLayout.model';
import { UIMap } from './map/Map.component';

interface UIContainerProps {
    uiManager: UIManager
}

export const UIContainer: React.FC<UIContainerProps> = props => {
    const { uiManager } = props;
    const [menuList, setMenuList] = useState<FloatMenuRef[]>([]);
    useEffect(() => {
        uiManager.floatMenuAddSubject.subscribe(newItem => {
            setMenuList([...menuList, newItem]);
        })
        uiManager.floatMenuRemoveSubject.subscribe(oldItem => {
            setMenuList(menuList.filter(item => item.id === oldItem.id));
        })
    }, [])
    return (
        <div id="ui-container">
            {uiManager.getHUD()}
            {menuList.map(data => {
                return (
                    <FloatMenu position={data.position} key={data.id} layout={new CircleAroundLayout(data.radius, data.items.length)}>
                        {uiManager.toReactChildren(data.items)}
                    </FloatMenu>
                )
            })}
        </div>
    )
}