import React from 'react';
import { createPortal } from 'react-dom';
import { If } from '../helpers/ControlFlow.components';
import "./styles.less";

interface DialogProps {
    show: boolean;
}

export const Dialog: React.FC<DialogProps> = props => {
    const { show, children } = props;
    return createPortal(
        (
            <If value={show}>
                <div className="dialog-wrapper">
                    {children}
                </div>
            </If>
        )
        , document.body)
}