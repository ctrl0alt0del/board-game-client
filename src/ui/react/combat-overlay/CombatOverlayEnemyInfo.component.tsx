import React from 'react';
import { Enemy } from '../../../game/enemy/Enemy.model';
import { getEnemyRequiredHitsToKill, getEnemyAttack } from '../../../game/enemy/Enemy.utils';
import { CalculationBreakdownComponent } from '../calculation-breakdown/CalculationBreakdown.component';
import { useService } from '../helpers/Hooks.utils';
import { GameEntitiesManager } from '../../../game-logic/GameEntityManager.service';

interface CombatOverlayEnemyInfoProps {
    enemy: Enemy
}

export const CombatOverlayEnemyInfo: React.FC<CombatOverlayEnemyInfoProps> = props => {
    const { enemy } = props;
    const entitiesManager = useService(GameEntitiesManager)
    const hp = getEnemyRequiredHitsToKill(enemy)(entitiesManager);
    const attack = getEnemyAttack(enemy)(entitiesManager)
    return (
        <div id="enemy-in-combat-info">
            <div className="enemy-in-combat-info-line">
                <img id="enemy-in-combat-info-image" src={enemy.config.enemyImageSrc} />
                <span>{enemy.config.name}</span>
            </div>
            <div className="enemy-in-combat-info-line">
                <span>Вразливі місця:</span>
                {enemy.config.weakBodyParts.map(hit => (<img className="inline-image" src={hit.image} />))}
            </div>
            <div className="enemy-in-combat-info-line">
                <span>HP:</span>
                <CalculationBreakdownComponent calculation={hp}/>
            </div>
            
            <div className="enemy-in-combat-info-line">
                <span>Attack:</span>
                <CalculationBreakdownComponent calculation={attack}/>
            </div>
            <div id="enemy-in-combat-info-background" />
        </div>
    )
}