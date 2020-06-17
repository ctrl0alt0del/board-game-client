import { Texture, ShaderMaterial, UniformsUtils, ShaderLib, DoubleSide, UniformsLib, Color, BackSide, FrontSide } from "three";
import { TileShaderFragment } from "../Tile.shader";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";

export enum ForceTileHighlightType {
    Disabled,
    None,
    All
}

export class TileMaterial extends ShaderMaterial {

    private _fowThreshold = 0;
    private _highlightedColors: Color[] = [];
    private timeUpdateId: any;
    private _enableColorHighlight = false;
    private _forceTileHighlightMode: ForceTileHighlightType = ForceTileHighlightType.Disabled;

    constructor(faceTexture: Texture, sectorTexture: Texture, warFogTexture: Texture, cloudTexture: Texture) {
        super({
            uniforms: UniformsUtils.merge([
                UniformsLib.lights,
                UniformsUtils.clone(ShaderLib.phong.uniforms),
                { warFogTexture: { value: null } },
                { cloudTexture: { value: null } },
                { map: { value: null } },
                { FOWThreshold: { value: warFogTexture ? 0.0 : 1.0 } },
                { time: { value: 0 } },
                { highlightSectorColors: { value: [] } },
                { sectorTexture: { value: null } },

            ]),
            defines: { USE_MAP: true, USE_UV: true, HIGHLIGHTED_COLOR_SIZE: 0, FLAT_SHADED: '', DOUBLE_SIDED: '', USE_SHADOWMAP: '' },
            vertexShader: ShaderLib.phong.vertexShader,
            fragmentShader: TileShaderFragment,
            side: DoubleSide,
            lights: true,

        });
        this.uniforms.map.value = faceTexture;
        this.uniforms.warFogTexture.value = warFogTexture;
        this.uniforms.cloudTexture.value = cloudTexture;
        this.uniforms.sectorTexture.value = sectorTexture;
        this.uniformsNeedUpdate = true;
        const startTime = Date.now();
        this.uniforms.shininess.value = 64.0;
        this.timeUpdateId = requestAnimationFrames(() => {
            this.uniforms.time.value = Date.now() - startTime;
            this.uniformsNeedUpdate = true;
        });
    }

    get highlightedColors() {
        return this._highlightedColors;
    }

    set highlightedColors(value: Color[]) {
        this.uniforms.highlightSectorColors.value = value;
        this.defines.HIGHLIGHTED_COLOR_SIZE = value.length;
        this.uniformsNeedUpdate = true;
        this.needsUpdate = true;
        this._highlightedColors = value;
    }

    get FOWThreshold() {
        return this._fowThreshold;
    }

    set FOWThreshold(value: number) {
        this._fowThreshold = value;
        this.uniforms.FOWThreshold.value = value;
        this.uniformsNeedUpdate = true;
    }

    get enableColorHighlight() {
        return this._enableColorHighlight;
    }

    set enableColorHighlight(value: boolean) {
        if (value !== this._enableColorHighlight) {
            this._enableColorHighlight = value;
            if (value) {
                this.defines.ENABLE_COLOR_HIGHLIGHT = '';
            } else {
                delete this.defines['ENABLE_COLOR_HIGHLIGHT'];
            }
            this.uniformsNeedUpdate = true;
            this.needsUpdate = true;
        }
    }

    get forceTileHighlightMode() {
        return this._forceTileHighlightMode;
    }

    set forceTileHighlightMode(value: ForceTileHighlightType) {
        if (value !== this._forceTileHighlightMode) {
            this._forceTileHighlightMode = value;
            switch (value) {
                case ForceTileHighlightType.Disabled:
                    delete this.defines['FORCE_HIGHLIGHT_MODE'];
                    break;
                default:
                    this.defines['FORCE_HIGHLIGHT_MODE'] = value;
                    break;
            }
            this.uniformsNeedUpdate = true;
            this.needsUpdate = true;
        }
    }

    dispose() {
        super.dispose();
        cancelRequestAnimationFrames(this.timeUpdateId);
    }

}