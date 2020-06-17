import React from 'react';

interface DialogButtonsLineProps {
}

export const DialogButtonsLine: React.FC<DialogButtonsLineProps> = props => {
    const { children } = props;
    return (
        <div className="dialog-body-buttons-line">
            {children}
        </div>
    )
}

interface DialogButtonProps {
    text: string;
    onClick?: () => void;
}

export const DialogButton: React.FC<DialogButtonProps> = props => {
    const { text, onClick } = props;
    return (
        <div className="dialog-button" onClick={() => onClick && onClick()}>
            {text}
        </div>
    )
}