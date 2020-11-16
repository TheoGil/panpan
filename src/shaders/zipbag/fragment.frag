#pragma glslify: strokeRotated = require(../helpers/strokeRotated.glsl)

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTransitionProgress;

void main() {
	vec4 color = texture2D(uTexture, vUv);
	float alphaMask = 1.;

	float angle = 1.7;
	float stripesCount = 4.;
	float stripeWidth = 0.5;
	float spread = 1. / stripesCount;

	for(float i = 0.; i < stripesCount; i++) {
		float progress = uTransitionProgress - i / stripesCount;
		float xPos = spread * i + spread / 2.;

		alphaMask -= strokeRotated(
			vUv,
			xPos,
			stripeWidth * progress,
			1.7
		);
	}

	float finalAlpha = color.a * alphaMask;

	gl_FragColor = vec4(
		color.rgb,
		finalAlpha
	);
}