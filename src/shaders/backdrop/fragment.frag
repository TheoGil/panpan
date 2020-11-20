#pragma glslify: noiseCoords = require(../helpers/noiseCoords)
#pragma glslify: roundBoxSDF = require(../helpers/roundBoxSDF)

varying vec2 vUv;
uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseAmount;
uniform float uBoxScale;
uniform float uBoxRadius;
uniform float uBoxSmoothness;
uniform float uColorMix;
uniform bool uInvert;

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
    // Adapted from the following GLSL sandbox → http://glslsandbox.com/e#39992.0
    // Not sure that it is the more elegant or performent way to mix between N values but it does the job.
    vec3 color = mix(color1, color2, smoothstep(step1, step2, uColorMix));
    color = mix(color, color3, smoothstep(step2, step3, uColorMix));
    color = mix(color, color4, smoothstep(step3, step4, uColorMix));
    color = mix(color, color1, smoothstep(step4, step5, uColorMix));

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