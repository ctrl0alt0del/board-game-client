import React from 'react';
import { CalculationBreakdown } from '../../../game-logic/CalculationBreakdown.model';
import './styles.less';
import { joinJSXArray } from '../../../utils/React.utils';
import { GameEffectOperationType } from '../../../game-logic/effects/GameEffect.model';
import { If } from '../helpers/ControlFlow.components';

interface CalculationBreakdownProps {
    calculation: CalculationBreakdown
}

export const CalculationBreakdownComponent: React.FC<CalculationBreakdownProps> = props => {
    const { calculation } = props;
    const parts = calculation.additions.filter(part => part.operation.operation !== GameEffectOperationType.NONE)
    return (
        <div className="calculation-breakdown">
            <div className="calculation-breakdown-result">
                {calculation.result}
            </div>
            <If value={parts.length > 0}>
                <div className="calculation-breakdown-sign calculation-breakdown-eq">
                    =
                </div>
            </If>
            {
                joinJSXArray(parts.map(add => {
                    const { displayable: { imageSrc, text } } = add.source;
                    return (
                        <div className="calculation-breakdown-value">
                            <div className="calculation-breakdown-value-header">
                                <If value={!!imageSrc}><img className='calculation-breakdown-source-image' src={imageSrc} /></If>
                                <span className='calculation-breakdown-source-name'>
                                    {text}
                                </span>
                            </div>
                            <div className="calculation-breakdown-value-number">
                                {add.operation.value}
                            </div>
                        </div>
                    )
                }), (
                    <div className="calculation-breakdown-sign calculation-breakdown-plus">
                        +
                    </div>
                ))
            }
        </div>
    )
}