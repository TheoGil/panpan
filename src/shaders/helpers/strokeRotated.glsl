#pragma glslify: rotate2d = require(./rotate2d.glsl)
#pragma glslify: stroke = require(./stroke.glsl)

float strokeRotated(vec2 uv, float s, float w, float a) {
	// Move origin
    uv -= vec2(0.5);
	
	// Apply rotation
	uv = uv * rotate2d(a);
    
	// Reset origin
    uv += vec2(0.5);
	
	return stroke(uv.x, s, w);
}

#pragma glslify: export(strokeRotated)