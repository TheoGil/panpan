mat2 rotate2d(float a){
    return mat2(
		cos(a), -sin(a),
		sin(a), cos(a)
	);
}

#pragma glslify: export(rotate2d)