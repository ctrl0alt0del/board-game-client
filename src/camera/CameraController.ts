import { PerspectiveCamera, Camera, Vector3, Vector2, Raycaster, Ray, Box3, Frustum, Matrix4, Plane, Line, Line3, BufferGeometry, Box2, Geometry } from "three";
import { MathUtils } from "../utils/Math.utils";
import { requestAnimationFrames, cancelRequestAnimationFrames, lerpNumbers } from "../utils/Common.utils";
import { Subject } from "rxjs";
import { GeometryUtils } from "../utils/Geometry.utils";

const cameraPosProportions = 1080;

export class CameraController {

    readonly cameraFov = 65;

    cameraRadius = cameraPosProportions * .45;
    cameraAngle = MathUtils.toRad(0);
    cameraTarget: Vector3 = new Vector3(0, 0, 0);

    cameraMove = new Subject<void>();

    private _cameraMotionTimerId;

    private readonly cameraElevation = cameraPosProportions;
    readonly camera: PerspectiveCamera = new PerspectiveCamera(this.cameraFov, window.innerWidth / window.innerHeight, 1, 2000);

    constructor() {
        this.initCamera();
    }

    updateCamera() {
    }

    private initCamera() {
        const { x, y } = MathUtils.polarToCartesian(this.cameraRadius, this.cameraAngle);
        this.camera.position.set(x, y, this.cameraElevation);
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(this.cameraTarget);
        this.camera.updateMatrix();
    }

    screenToWorld({ x, y }: Vector2) {
        return new Vector3(x / window.innerWidth * 2 - 1, - y / window.innerHeight * 2 + 1, -1).unproject(this.camera);
    }

    worldToScreen(vector: Vector3) {
        this.camera.updateMatrixWorld();
        const pos = vector.clone();
        pos.project(this.camera);
        const width = window.innerWidth, height = window.innerHeight;
        const widthHalf = width / 2, heightHalf = height / 2;
        return new Vector2((pos.x * widthHalf) + widthHalf, - (pos.y * heightHalf) + heightHalf);
    }

    getRay(vec3: Vector3) {
        return new Ray(this.camera.position, new Vector3().subVectors(vec3, this.camera.position).normalize());
    }

    setCameraVelocity(vector: Vector2) {
        if (this._cameraMotionTimerId) {
            cancelRequestAnimationFrames(this._cameraMotionTimerId);
        }
        if (vector.x !== 0 || vector.y !== 0) {
            this._cameraMotionTimerId = requestAnimationFrames((_, deltaMs) => {
                const deltaS = deltaMs / 1000;
                const { x, y, z } = this.camera.position;
                this.camera.position.set(x + vector.x * deltaS, y + vector.y * deltaS, z);
                this.camera.updateMatrixWorld();
                this.cameraMove.next();
            })
        }
    }

    fitCameraToBox(box: Box3, offset = 1.5) {
        const center = new Vector3(), size: Vector3 = new Vector3();
        box.getCenter(center);
        const { x, y } = MathUtils.polarToCartesian(500, MathUtils.toRad(-45));
        const timeToTravel = 800;
        const originalCameraPosition = this.camera.position.clone();
        this._cameraMotionTimerId = requestAnimationFrames((passed) => {
            const lerpCoef = Math.min(1, passed / timeToTravel);
            const interpolated = originalCameraPosition.clone().lerp(new Vector3(x + center.x, y + center.y, 750), lerpCoef);
            this.camera.position.set(interpolated.x, interpolated.y, interpolated.z);
            this.camera.lookAt(center);
            if (passed >= timeToTravel) {
                cancelRequestAnimationFrames(this._cameraMotionTimerId);
            }
        })
    }

    getFrustrumIntersectionWithPlane(plane: Plane) {
        this.camera.updateMatrixWorld();
        this.camera.updateProjectionMatrix();
        const farNDCPoints = [new Vector3(-1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, -1, 1), new Vector3(-1, -1, 1)];
        return farNDCPoints.map(farCornerPointNDC => {
            const worldFarCornerPoint = farCornerPointNDC.unproject(this.camera);
            if (plane.intersectsLine(new Line3(this.camera.position, worldFarCornerPoint))) {
                const output = new Vector3();
                plane.intersectLine(new Line3(this.camera.position, worldFarCornerPoint), output);
                return output
            } else {
                return null;
            }
        })
    }

    computeScreenSpaceBoundingBox(geometry: BufferGeometry, transformMatrix: Matrix4) {
        var vertex = new Vector3();
        var min = new Vector3(1, 1, 1);
        var max = new Vector3(-1, -1, -1);
        for(const vertCoordArray of GeometryUtils.getVerticesFfromBufferGeometry(geometry)) {

            var vertexWorldCoord = vertex.set(...vertCoordArray).applyMatrix4(transformMatrix);
            var vertexScreenSpace = vertexWorldCoord.project(this.camera);
            min.min(vertexScreenSpace);
            max.max(vertexScreenSpace);
        }

        const min2 = new Vector2(min.x, min.y);
        const max2 = new Vector2(max.x, max.y);
        const width = window.innerWidth, height = window.innerHeight;
        const scale = new Vector2(width/2, height/2);
        min2.multiply(scale).add(scale);
        max2.multiply(scale).add(scale)
        return new Box2(min2, max2);
    }
}