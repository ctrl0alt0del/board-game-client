import React, { useEffect, useState } from 'react';

interface AnimationProps {
    duration: number;
    delay: number
    onComplete?: () => void;
}

export const UIAnimation: React.FC<AnimationProps> = props => {
    const { duration, onComplete, delay } = props;
    const [isCompleted, complete] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            complete(false);
            setTimeout(() => {
                onComplete && onComplete();
                complete(true);
            }, duration)
        }, delay)
    }, [])
    return !isCompleted && <React.Fragment>{props.children}</React.Fragment>;
}