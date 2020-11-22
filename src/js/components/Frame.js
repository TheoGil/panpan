import { Mesh, Object3D, PlaneBufferGeometry, ShaderMaterial } from "three";

import vertexShader from "../../shaders/frame/vertex.vert";
import fragmentShader from "../../shaders/frame/fragment.frag";

const COLOR_SKIMMING_SPEED = 0.005;

// @TODO
// This class is very similar to the Backdrop class and pretty redundant.
// Those two could easily be merged...
class Frame extends Object3D {
  constructor(options) {
    super(options);

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
          value: 0,
        },
        uColorMix: {
          value: 0,
        },
        uBorderWidth: {
          value: 0,
        },
        uAspect: {
          value: options.height / document.body.clientWidth,
        },
      },
    });

    this.geometry = new PlaneBufferGeometry(
      document.body.clientWidth, // Width should not include scrollbar!
      options.height,
      1,
      1
    );

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(
      -(window.innerWidth - document.body.clientWidth) / 2,
      options.yPos,
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

  dispose() {
    this.remove(this.mesh);
    this.mesh.material.dispose();
    this.mesh.geometry.dispose();
  }
}

export default Frame;
