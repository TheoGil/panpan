vec3 color1 = vec3(1.000, 0.858, 0.811); // Peach
vec3 color2 = vec3(0.941, 0.823, 1.000); // Lavender
vec3 color3 = vec3(0.847, 0.929, 1.000); // Sky
vec3 color4 = vec3(0.811, 0.960, 0.811); // Pistachio

float step1 = 0.00;
float step2 = 0.25;
float step3 = 0.50;
float step4 = 0.75;
float step5 = 1.00;

// Adapted from the following GLSL sandbox → http://glslsandbox.com/e#39992.0
// Not sure that it is the more elegant or performent way to mix between N values but it does the job.
vec3 colorMixer(float t) {
    vec3 color = mix(color1, color2, smoothstep(step1, step2, t));
    color = mix(color, color3, smoothstep(step2, step3, t));
    color = mix(color, color4, smoothstep(step3, step4, t));
    color = mix(color, color1, smoothstep(step4, step5, t));
    return color;
}

#pragma glslify: export(colorMixer)