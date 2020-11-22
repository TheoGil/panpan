#pragma glslify: noiseCoords = require(../helpers/noiseCoords)
#pragma glslify: colorMixer = require(../helpers/colorMixer)

varying vec2 vUv;
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseAmount;
uniform float uBorderWidth;
uniform float uAspect; // ratio of width to height
uniform float uColorMix;

vec3 color1 = vec3(1.000, 0.858, 0.811); // Peach
vec3 color2 = vec3(0.941, 0.823, 1.000); // Lavender
vec3 color3 = vec3(0.847, 0.929, 1.000); // Sky
vec3 color4 = vec3(0.811, 0.960, 0.811); // Pistachio

float step1 = 0.00;
float step2 = 0.25;
float step3 = 0.50;
float step4 = 0.75;
float step5 = 1.00;

void main() {
    vec3 color = colorMixer(uColorMix);
	vec2 coords = noiseCoords(vUv, uNoiseScale, uNoiseAmount, uTime);

    // Adapted from the following GLSL sandbox → https://gamedev.stackexchange.com/a/83469
    float minX = uBorderWidth;
    float maxX = 1.0 - uBorderWidth;
    float minY = minX / uAspect;
    float maxY = 1. - minY;

    if (
        coords.x < minX ||
        coords.x > maxX ||
        coords.y < minY ||
        coords.y > maxY
    ) {
        gl_FragColor = vec4(color, 1.);
    } else {
        discard;
    }
}