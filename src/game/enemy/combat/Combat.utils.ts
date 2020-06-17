import { Combat } from './Combat.model';
import { Vector3 } from 'three';
import { mergeBoxes } from '../../../utils/Common.utils';

export const getCombatBoundingBox = (combat: Combat) => {
    const { enemy, player: { character: playerCharacter } } = combat;
    const commonBox = mergeBoxes(enemy.tokenMesh, playerCharacter.object3d);
    return commonBox;
}