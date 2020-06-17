import React from 'react';

interface IfProps  {
    value: boolean;
}

export const If: React.FC<React.PropsWithChildren<IfProps>> = ({value, children}) => {
    return value ? <React.Fragment>{children}</React.Fragment> : null;
} 