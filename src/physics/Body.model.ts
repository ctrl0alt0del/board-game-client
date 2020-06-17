import { Point } from './Point.model';
import { Acceleration } from './Acceleration.model';
import { Vector3 } from 'three';
import { Constraint } from './Constraint.model';
import { PointTrack } from './Track.model';
import { ConstraintResolveResult, PointUpdateResult } from './utils/Types.utils';
export class Body {
    points: Point[] = [];

    private accelerations: Acceleration[] = [];
    private impulses: Acceleration[] = [];
    private constrains: Constraint[] = [];


    addConstraint(constr: Constraint) {
        this.constrains.push(constr);
    }

    setAcceleration(acc: Acceleration) {
        this.accelerations.push(acc);
    }

    removeAcceleration(acc: Acceleration) {
        this.accelerations = this.accelerations.filter(a => acc !== a);
    }

    applyAcceleration(acc: Acceleration) {
        this.impulses.push(acc);
    }

    update(delta: number) {
        const totalAcc = [...this.accelerations, ...this.impulses].reduce((output, acc) => output.add(acc.value), new Vector3());
        const output = this.points.map<PointUpdateResult>(point => {
            const {acceleration, constraints} = this.calculateIndividualAcceleration(totalAcc, point, delta);
            const iterComputation = point.update(delta, acceleration);
            iterComputation.next();
            const {acceleration: acc2, constraints: constr2} = this.calculateIndividualAcceleration(totalAcc, point, delta);
            iterComputation.next(acc2);
            return {
                activeConstraints: constraints.concat(constr2),
                targetPoint: point
            }
        })
        this.impulses = [];
        return output;
    }

    compute(duration: number, iterationPerSecond: number) {
        const delta = 1 / iterationPerSecond;
        const tracks = this.points.map(point => new PointTrack(duration, iterationPerSecond));
        for (let second = 0; second < duration; second += 1) {
            for (let iterNumber = 0; iterNumber < iterationPerSecond; iterNumber++) {
                const info = this.update(delta);
                for (let pointIndex = 0; pointIndex < this.points.length; pointIndex++) {
                    tracks[pointIndex].addFromPointUpdate(info[pointIndex]);
                }
            }
        }
        return tracks;
    }

    private calculateIndividualAcceleration(totalAcc: Vector3, point: Point, delta: number): ConstraintResolveResult {
        const individualAcc = totalAcc.clone();
        const activatedConstraints: Constraint[] = [];
        for (const constr of this.constrains) {
            constr.constrain(point, delta).map(acc => {
                activatedConstraints.push(acc.source!);
                individualAcc.add(acc.value);
            });
        }
        return {
            acceleration: individualAcc,
            constraints: activatedConstraints
        };
    }
}