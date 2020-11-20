varying vec2 vUv;
uniform float u_time;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
}