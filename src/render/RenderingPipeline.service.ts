import { Injectable, Inject } from "injection-js";
import { Renderer, Scene, Camera, WebGLRenderer, ShadowMapType, VSMShadowMap, PCFShadowMap, PCFSoftShadowMap, Vector2, Object3D, Color, LinearFilter, RGBAFormat, WebGLRenderTarget, LinearEncoding } from "three";
import { CameraController } from "../camera/CameraController";
import { SceneComposer } from "../scene/SceneComposer";
import { MathUtils } from "../utils/Math.utils";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import { Subject, BehaviorSubject } from "rxjs";
import { OutlineManagaer } from "./OutliningManager.model";
import { requestAnimationFrames } from "../utils/Common.utils";

export type OutlineEffectStyle = {
    edgeGlow: number,
    edgeThickness: number,
    edgeStrength: number,
    visibleEdgeColor: Color,
    hiddenEdgeColor: Color,
    pulsePeriod: number
}
const DEFAULT_OUTLINE_STYLE: OutlineEffectStyle = {
    edgeGlow: 0,
    edgeThickness: .1,
    edgeStrength: 15,
    visibleEdgeColor: new Color(0x00ff00),
    hiddenEdgeColor: new Color(0x00ff00),
    pulsePeriod: 0
}

@Injectable()
export class RenderingPipelineService {
    renderer: WebGLRenderer = new WebGLRenderer({
        precision: 'highp',
        powerPreference: 'high-performance',
        antialias: true,
    });

    private composer: EffectComposer;
    private outlinePass: OutlinePass;
    private outliningObjects: OutlineManagaer[] = [];

    frame = new Subject<void>();

    private frameRateCounter = 0;
    private prevAnimSecondNumber = 0;

    frameRate = new BehaviorSubject<number>(0);

    constructor(
        @Inject(CameraController) private cameraCtrl: CameraController,
        @Inject(SceneComposer) private sceneComposer: SceneComposer
    ) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(0xffffff);
        //this.renderer.outputEncoding = LinearEncoding;
        this.renderer.shadowMap.type = PCFSoftShadowMap; //Graphic Settings
        //this.renderer.shadowMap.autoUpdate = false;
        //this.renderer.physicallyCorrectLights = true;
        this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), sceneComposer.scene, cameraCtrl.camera);
        this.outlinePass.enabled = false;


        const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.composer = new EffectComposer(this.renderer, renderTarget)
        this.applyOutlineStyle();
        this.composer.addPass(new SSAARenderPass(sceneComposer.scene, cameraCtrl.camera, 0x000000, 0x00));
        this.composer.addPass(this.outlinePass)
    }

    applyOutlineStyle(style: Partial<OutlineEffectStyle> = DEFAULT_OUTLINE_STYLE) {
        this.outlinePass.edgeGlow = style.edgeGlow || DEFAULT_OUTLINE_STYLE.edgeGlow;
        this.outlinePass.visibleEdgeColor = style.visibleEdgeColor || DEFAULT_OUTLINE_STYLE.visibleEdgeColor;
        this.outlinePass.hiddenEdgeColor = style.hiddenEdgeColor || DEFAULT_OUTLINE_STYLE.hiddenEdgeColor;
        this.outlinePass.edgeThickness = style.edgeThickness || DEFAULT_OUTLINE_STYLE.edgeThickness;
        this.outlinePass.edgeStrength = style.edgeStrength || DEFAULT_OUTLINE_STYLE.edgeStrength;
        this.outlinePass.pulsePeriod = style.pulsePeriod || DEFAULT_OUTLINE_STYLE.pulsePeriod;
    }

    private readonly animate = () => {
        ///this.cameraCtrl.cameraAngle += MathUtils.toRad(1)
        this.cameraCtrl.updateCamera();
        //this.renderer.render(this.sceneComposer.scene, this.cameraCtrl.camera);
        this.composer.render();
        this.frame.next();
    }
    start() {
        this.makeFullSpace();
        document.body.appendChild(this.renderer.domElement);
        this.animate();
        requestAnimationFrames((passedMs, delta)=>{
            this.animate();
            const passedS = Math.floor(passedMs / 1000);
            if(passedS !== this.prevAnimSecondNumber) {
                this.frameRate.next(this.frameRateCounter);
                this.frameRateCounter = 0;
            } else {
                this.frameRateCounter++;
            }
            this.prevAnimSecondNumber = passedS;
        })
    }
    private makeFullSpace() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    addOutlineObjects(objects: Object3D[], style?: Partial<OutlineEffectStyle>) {
        this.outlinePass.enabled = true;
        if (!this.outlinePass.selectedObjects.some(obj => obj.uuid === objects[0].uuid)) {
            this.outlinePass.selectedObjects.push(...objects);
            this.applyOutlineStyle(style);
        }
    }
    removeOutlineObjects(objects: Object3D[]) {
        this.outlinePass.selectedObjects = this.outlinePass.selectedObjects.filter(object3d => !objects.some(obj => object3d === obj));
        if(this.outlinePass.selectedObjects.length === 0) {
            this.outlinePass.enabled = false;
        }
        this.applyOutlineStyle();
    }
    clearOutline() {
        this.outliningObjects.forEach(man => man.destroy())
    }
}