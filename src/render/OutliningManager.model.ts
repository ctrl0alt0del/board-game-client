import { Object3D, Mesh, MeshBasicMaterial, BackSide, DoubleSide, MeshPhongMaterial, Material, ShaderMaterial, Color, UniformsUtils, Matrix4, Vector3, Box3 } from "three";
import { getObject3DMeshes, requestAnimationFrames } from "../utils/Common.utils";
import { MathUtils } from "../utils/Math.utils";
import { ObjectsRenderingOrder } from "../game/GameConstants.utils";
import { compileHelpersLib, ShaderHelpFunctionType } from "../shaders/Shaders.utils";

const outlineVertexShader = `
    uniform float width;
    uniform float time;
    varying float something;
    void main() {
        vec4 pos = modelViewMatrix * vec4(position + normal * width, 1.0);
        gl_Position = projectionMatrix * pos;
    }
`

const outlineFragmentShader = `
    ${compileHelpersLib([ShaderHelpFunctionType.Noise])}
    uniform vec3 color;
    uniform float time;
    varying float something;
    void main() {
        vec2 shift = vec2(sin(time), cos(time)) * 5.;
        gl_FragColor = vec4(color, 1.);
    }
`

class OutlineMaterial extends ShaderMaterial {
    private timeUpdateId;
    constructor(color: Color, width: number) {
        super({
            uniforms: UniformsUtils.merge(
                [
                    { color: { value: null } },
                    { width: { value: null } },
                    { time: { value: 0 } }
                ]
            ),
            vertexShader: outlineVertexShader,
            fragmentShader: outlineFragmentShader,
            wireframe: true
        });
        this.depthTest = false;
        this.uniforms.color.value = color;
        this.uniforms.width.value = width;
        this.uniformsNeedUpdate = true;
        this.needsUpdate = true;
        this.timeUpdateId = requestAnimationFrames((passMs) => {
            this.uniforms.time.value = passMs / 100;
            this.uniformsNeedUpdate = true;
        });
    }
}

export class OutlineManagaer {
    private outliners: Mesh[] = [];
    constructor(readonly object3d: Object3D) {
        this.init();
    }

    private init() {
        const meshes = getObject3DMeshes(this.object3d);
        for (const mesh of meshes) {
            const outliner = new Mesh(mesh.geometry, new OutlineMaterial(new Color(.2, .95, 0.2), 3));
            mesh.renderOrder = mesh.renderOrder + 1;
            outliner.renderOrder = mesh.renderOrder-1;
            mesh.add(outliner);
            this.outliners.push(outliner);
        }
    }

    destroy() {
        getObject3DMeshes(this.object3d).forEach(mesh => mesh.renderOrder -= 1);
        this.outliners.forEach(outliner => outliner.parent.remove(outliner));
        this.outliners = [];
    }
}