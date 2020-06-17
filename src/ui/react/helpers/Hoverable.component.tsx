import React from 'react';
import { HoverableProps } from './Hooks.utils';


export const Hoverable: React.FC<HoverableProps<any> & { hoverType: any }> = props => {
    const child = React.Children.only(props.children);
    return (
        <React.Fragment>
            {React.Children.map(child, (child: React.DetailedReactHTMLElement<any, any>) => {
                return React.cloneElement(child, Object.assign({}, child.props, {
                    onMouseEnter: () => props.onHover && props.onHover(true, props.hoverType),
                    onMouseLeave: () => props.onHover && props.onHover(false, props.hoverType)
                }))
            })}
        </React.Fragment>
    )
}