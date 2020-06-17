import { ShaderChunk } from "three";

const customMapFragment = `
#extension GL_OES_standard_derivatives : enable
#ifdef USE_MAP
	vec4 cloudColor = texture2D( cloudTexture, vUv);
	float r = sqrt(length(vUv));
	vec2 distortedUV = vec2(mod(vUv.x + cloudColor.x * sin(time*.0003)*.8 + time, 1.), vUv.y);
    vec4 texelColor;
    if(cloudColor.x < FOWThreshold) {
        texelColor = texture2D( map, vUv );
    } else {
        texelColor = texture2D( warFogTexture, vUv );
    }
	vec4 sectorColor = texture2D( sectorTexture, vUv );
	#ifdef ENABLE_COLOR_HIGHLIGHT
		vec4 highlightKoef = vec4(1., 1., 1., 1.);
		#ifdef FORCE_HIGHLIGHT_MODE
			#if FORCE_HIGHLIGHT_MODE == 1
				highlightKoef = texture2D(cloudTexture, distortedUV)*0.7;
			#endif
		#else
			bool highlight = isHighlightedColor(sectorColor);
			if(!highlight && !(sectorColor.x > 0.5 && sectorColor.y > 0.5 && sectorColor.z > 0.5)) {
				highlightKoef = texture2D(cloudTexture, distortedUV)*0.7;
			}
		#endif
		texelColor *=  highlightKoef;
	#endif
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;

#endif
`

export const TileShaderFragment = `
#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform sampler2D warFogTexture;
uniform sampler2D cloudTexture;
uniform float FOWThreshold;
uniform float time;
#if HIGHLIGHTED_COLOR_SIZE > 0
	uniform vec3 highlightSectorColors[HIGHLIGHTED_COLOR_SIZE];
#endif
uniform sampler2D sectorTexture;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

bool isHighlightedColor(vec4 color) {
	vec3 rgb = color.xyz;
	#if HIGHLIGHTED_COLOR_SIZE > 0
		for(int i = 0; i < HIGHLIGHTED_COLOR_SIZE; i++) {
			if(highlightSectorColors[i] == rgb) {
				return true;
			}
		}
	#endif
	return false;
}

void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	${customMapFragment}
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	// modulation
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;