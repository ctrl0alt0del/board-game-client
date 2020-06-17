import React from 'react';
import './styles.less';
import { rangeArray, pickKey } from '../../../../utils/Common.utils';
import { ArrayUtils } from '../../../../utils/Array.utils';
import { SumNumberMonoid, morphMonoid } from '../../../../utils/fp/Monoid';

interface RulerItemProps {
    active?: boolean;
    defaultColor: string;
    activeColor?: string;
    index?: number;
}

const RulerItem: React.FC<RulerItemProps> = props => {
    const { defaultColor, active, activeColor, index } = props;
    const style = { borderColor: defaultColor };
    return (
        <div className={"ruler-item"} style={style}>
            {index ? <div className='ruler-index' style={{ color: defaultColor }}>{index}</div> : null}
            {active && <div className="ruler-sub-item" style={{ backgroundColor: activeColor }} />}
        </div>
    )
}

type RulerValue = {
    value: number;
    color: string;
};

interface RulerComponentProps {
    total: number;
    globalColor: string;
    values: RulerValue[];
}


const getRulerActiveStatus = (values: RulerValue[], index: number) => {
    return values.reduce((candidate, value, i) => ArrayUtils.compose(values.map(pickKey('value')), SumNumberMonoid, i - 1) < index ? value : candidate, null);
}

export const RulerComponent: React.FC<RulerComponentProps> = props => {
    const { total, globalColor, values } = props;
    return (
        <div className='ruler-wrapper'>
            {rangeArray(total, 1).map(index => Object.assign({}, getRulerActiveStatus(values, index), { index })).map(({ index, value, color }) => <RulerItem defaultColor={globalColor} active={value > index - 1} activeColor={color} key={index} index={index === value || index === total ? index : 0} />)}
        </div>
    )
}