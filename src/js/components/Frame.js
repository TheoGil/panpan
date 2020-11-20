import { Mesh, Object3D, PlaneBufferGeometry, ShaderMaterial } from "three";

import vertexShader from "../../shaders/backdrop/vertex.vert";
import fragmentShader from "../../shaders/backdrop/fragment.frag";

const COLOR_SKIMMING_SPEED = 0.005;

class Frame extends Object3D {
  constructor() {
    super();

    this.frameCount = 0;
    this.shouldUpdateBackdropsFrame = false;

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: {
          value: 0,
        },
        uNoiseScale: {
          value: 5,
        },
        uNoiseAmount: {
          value: 0.0015,
        },
        uBoxScale: {
          value: 0.49,
        },
        uBoxRadius: {
          value: 0,
        },
        uBoxSmoothness: {
          value: 0.001,
        },
        uColorMix: {
          value: 0,
        },
        uInvert: {
          value: true,
        },
      },
    });

    this.geometry = new PlaneBufferGeometry(
      document.body.clientWidth, // Width should not include scrollbar!
      window.innerHeight,
      1,
      1
    );

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(
      -(window.innerWidth - document.body.clientWidth) / 2,
      0,
      0
    );

    this.add(this.mesh);
  }

  update() {
    this.frameCount += 1;

    if (this.frameCount > 25) {
      this.shouldUpdateBackdropsFrame = true;
      this.frameCount = 0;
    }

    this.mesh.material.uniforms.uColorMix.value += COLOR_SKIMMING_SPEED;
    if (this.mesh.material.uniforms.uColorMix.value > 1) {
      this.mesh.material.uniforms.uColorMix.value = 0;
    }

    // Update time
    if (this.shouldUpdateBackdropsFrame) {
      this.mesh.material.uniforms.uTime.value++;
    }

    this.shouldUpdateBackdropsFrame = false;
  }

  updatePosition(y) {
    this.position.y = y;
  }
}

export default Frame;
