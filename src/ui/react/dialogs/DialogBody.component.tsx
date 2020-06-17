import React from 'react';
import { createPortal } from 'react-dom';

export const DialogBody: React.FC = ({ children }) => {
    return createPortal(
        (
            <div className='dialog-body'>
                {children}
            </div>
        ),
        document.body
    )
}