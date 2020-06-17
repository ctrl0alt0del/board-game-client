import React from 'react';
import { DialogBody } from './DialogBody.component';
import { useMaybeRender } from '../helpers/Hooks.utils';
import { Maybe } from '../../../utils/fp/Maybe';

interface SourceDialogBodyProps {
    image?: string;
    title: string;
}

export const SourceDialogBody: React.FC<SourceDialogBodyProps> = props => {
    const { image, title, children } = props;
    const ImageSrc = useMaybeRender(Maybe.from(image));
    return (
        <React.Fragment>
            <div className="dialog-body-source-title">{title}</div>
            <div className="dialog-body-source-layout">
                <ImageSrc>
                    {
                        src => (
                            <div className="dialog-body-source-image">
                                <img src={src} />
                            </div>
                        )
                    }
                </ImageSrc>
                <div className="dialog-body-source-content">
                    {children}
                </div>
            </div>
        </React.Fragment>
    )
}