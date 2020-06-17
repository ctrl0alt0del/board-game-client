import React, { useRef, useEffect } from 'react';
import { SpeedLineManager } from './utils/Speedlines.model';
import { requestAnimationFrames, cancelRequestAnimationFrames } from '../../../../utils/Common.utils';
import { UIAnimation } from '../../helpers/Animation/Animation.component';

export const CombatStartOverlayCanvas: React.FC = props => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth * 1;
            canvas.height = window.innerHeight * .75;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            const speedlines = new SpeedLineManager(500, context, { width: canvas.width, height: canvas.height });
            animationRef.current = requestAnimationFrames((passedMs) => {
                const koef = 1 / Math.log(Math.min(Math.E, passedMs / 2000));
                const boltDelta = .9;
                const shift = koef * boltDelta;
                context.fillStyle = '#ff0';
                context.fillRect(0, 0, canvas.width, canvas.height);
                speedlines.update({ width: canvas.width, height: canvas.height });
            })
        } else {
            if (animationRef.current) {
                cancelRequestAnimationFrames(animationRef.current)
            }
        }
    }, [canvasRef.current])
    return (
        <div id="canvas-effect-wrapper">
            <canvas ref={canvasRef} />
            <UIAnimation delay={1000} duration={1000000}>
                <div id="combat_player_image" className="combat_participant_wrapper">
                    <img src="/text/combat_imgs/brotherhood_unit.png" />
                </div>
                <div id="vs_text">VS</div>
                <div id="combat_enemy_image" className="combat_participant_wrapper">
                    <img src="/text/combat_imgs/feral_ghoul.png" />
                </div>
            </UIAnimation>
        </div>
    )
}