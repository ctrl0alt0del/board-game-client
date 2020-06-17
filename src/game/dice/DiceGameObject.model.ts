import { GameObject } from "../game-object/GameObject.model";
import { Object3D, Mesh, Vector3, Plane } from "three";
import { GameAnimationFunction } from "../game-object/animation/Animation.model";
import { DiceSideType } from "./DieResult.interface";
import { Point } from '../../physics/Point.model';
import { Body } from '../../physics/Body.model';
import { Acceleration } from "../../physics/Acceleration.model";
import { getGravityAcceleration, getVelocityVector } from "../../physics/utils";
import { pickVectorComponent, Vector3Components, getRandomSign } from "../../utils/Common.utils";
import { PlaneConstraint } from "../../physics/impl/constrains/PlaneConstraint.model";
import { GravityConstraint } from "../../physics/impl/constrains/GravityConstraint.model";
import { MathUtils } from "../../utils/Math.utils";
import { getDieRotationForFacingSide } from "./Dice.utils";
import { DieSide } from "./DiceSide.model";
import { randomEasingOf, linearEasing, easeInSine, easeOutSine } from "../game-object/animation/EasingFunciton.utils";

export class DiceObject extends GameObject {

    constructor(private diceMesh: Mesh) {
        super();
    }
    setReceiveShadowState(state: boolean) {
    }
    protected factoryMesh(): Object3D {
        this.diceMesh.scale.set(20, 20, 20);
        this.diceMesh.castShadow = true;
        return this.diceMesh;
    }

    getAnimation(desiredSide: DieSide, startPosition: Vector3, landPosition: Vector3, duration: number): GameAnimationFunction {
        const velocity = getVelocityVector(pickVectorComponent(startPosition, Vector3Components.X), pickVectorComponent(landPosition, Vector3Components.X), duration/2);
        const point = new Point(startPosition, velocity);
        const body = new Body();
        const planeConstraint = new PlaneConstraint(new Plane(new Vector3(0, 0, 1), 0));
        body.points.push(point);
        body.addConstraint(planeConstraint);
        body.addConstraint(new GravityConstraint());
        const [pointTrack] = body.compute(duration, 120);
        const initialRotation = desiredSide.dieRotation;
        this.object3d.rotation.set(initialRotation?.x, initialRotation?.y, initialRotation?.z);
        const finalRotation =  initialRotation.clone().add(new Vector3(getRandomSign() * Math.PI * 2, getRandomSign() * Math.PI * 2, getRandomSign() * Math.PI * 2));
        const easeFn = randomEasingOf([linearEasing, easeInSine, easeOutSine]);
        return (param, delta) => {
            const koef = param * 3;
            if(koef > .2) {
                const lerpKoef = easeFn(Math.min(1, (koef - .2)/1.25));
                const rot = new Vector3().lerpVectors(initialRotation, finalRotation, lerpKoef);
                this.object3d.rotation.set(rot.x, rot.y, rot.z)
            }
            const result = pointTrack.get(param * duration);
            if (result) {
                const {position: pos, activeConstraints} = result;
                this.object3d.position.set(pos.x, pos.y, pos.z+20);
            }
        }
    }

}