import { Object3D, Mesh, CircleGeometry, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";
import { ObjectsRenderingOrder } from "../GameConstants.utils";

export class MapGuider extends Object3D {

    private animateCirclesId = null;
    private interpolatePositionsId = null;

    constructor() {
        super();
        for (let i = 0; i < 11; i++) {
            let item: Mesh;
            if (i === 10) {
                item = new Mesh(new CircleGeometry(2.5, 32), new MeshBasicMaterial({
                    color: 0x34a4ef,
                    depthTest: false,
                    transparent: true
                }));
                item.renderOrder = ObjectsRenderingOrder.Helpers;
            } else {
                item = new Mesh(new SphereGeometry(.75), new MeshBasicMaterial({
                    color: 0x34a4ef,
                    depthTest: false,
                    transparent: true
                }));
                item.renderOrder = ObjectsRenderingOrder.Helpers;
            }
            item.scale.set(10, 10, 10);
            this.add(item);
        }
        this.renderOrder = ObjectsRenderingOrder.Helpers;
        this.visible = false;
    }

    updatePositions(pos1: Vector3, pos2: Vector3) {
        if (this.animateCirclesId) {
            cancelRequestAnimationFrames(this.animateCirclesId);
            
        }
        if (this.interpolatePositionsId) {
            cancelRequestAnimationFrames(this.interpolatePositionsId);
            
        }
        this.interpolatePositionsId = requestAnimationFrames((passedMs) =>{
            if(passedMs >= 500) {
                cancelRequestAnimationFrames(this.interpolatePositionsId);
            } else {
                
                this.initiateNewPositions(pos1, pos2, passedMs/500);
            }
        })
    }

    private initiateNewPositions(pos1: Vector3, pos2: Vector3, lerp?: number) {
        if (this.animateCirclesId) {
            cancelRequestAnimationFrames(this.animateCirclesId);   
        }
        this.recalculateChildrenPositions(pos1, pos2, 0, lerp);
        this.animateCirclesId = requestAnimationFrames((passedMs) => {
            const lerpValue = (passedMs / 200) % 2;
            this.recalculateChildrenPositions(pos1, pos2, lerpValue, lerp);
        });
    }

    private recalculateChildrenPositions(pos1: Vector3, pos2: Vector3, lerp: number = 0, lerp2?: number) {
        pos2 = lerp2 === void 0 ? pos2 : this.children[10].position.clone().lerp(pos2, lerp2)
        for (let i = 0; i < (lerp === 0 ? 22 : 20); i++) {
            if (i % 2 === 0) {
                continue;
            }
            
            const lerpingI = i + lerp;
            const pos = pos1.clone().lerp(pos2, lerpingI / 20);
            const arrow = this.children[Math.floor(i / 2)];
            arrow.position.set(pos.x, pos.y, pos.z + 50 * Math.sin(lerpingI * Math.PI / 20));
        }
    }
}