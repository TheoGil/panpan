#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

float yOff = 90.;

vec2 noiseCoords(
    vec2 coord,
    float noiseScale,
    float noiseAmount,
    float time
) {
    vec2 newCoord = coord;
    
    newCoord.x += snoise3(
        vec3(coord * vec2(noiseScale), time)
    ) * noiseAmount;
    
    newCoord.y += snoise3(
        vec3(coord * vec2(noiseScale), time + yOff)
    ) * noiseAmount;
    
    return newCoord; 
}

#pragma glslify: export(noiseCoords)