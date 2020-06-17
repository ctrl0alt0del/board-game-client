import React, { Children, Fragment } from "react";

export const joinJSXArray = (array: JSX.Element[], joiner: JSX.Element) => {
    return Children.map(array, (item, index) => {
        return (
            <Fragment key={item.key}>
                {item}
                {index < array.length - 1 ? joiner : null}
            </Fragment>
        )
    })
}