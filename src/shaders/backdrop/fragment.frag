#pragma glslify: noiseCoords = require(../helpers/noiseCoords)
#pragma glslify: roundBoxSDF = require(../helpers/roundBoxSDF)
#pragma glslify: colorMixer = require(../helpers/colorMixer)

varying vec2 vUv;
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseAmount;
uniform float uBoxScale;
uniform float uBoxRadius;
uniform float uBoxSmoothness;
uniform float uColorMix;
uniform bool uInvert;

void main() {
    vec3 color = colorMixer(uColorMix);

	vec2 noisyCoords = noiseCoords(vUv, uNoiseScale, uNoiseAmount, uTime);
    float alpha = roundBoxSDF(
        noisyCoords - vec2(.5), 
        vec2(uBoxScale), 
        uBoxRadius,
        uBoxSmoothness
    );

    if (uInvert) {
        alpha = 1. - alpha;
    }

	gl_FragColor = vec4(color, alpha);
}