varying vec3 vNormal;
varying vec2 vUv;

void main() {
	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <project_vertex>
	vUv = uv;
}