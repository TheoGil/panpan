// Credits → https://www.shadertoy.com/view/ldfSDj
float roundBoxSDF( vec2 p, vec2 size, float radius, float smoothing )
{
    return 1. - smoothstep(
        0.0,
        smoothing,
        length(
            max(
                abs(p) - size + radius,
                0.0
            )
        ) - radius
    );
}

#pragma glslify: export(roundBoxSDF)