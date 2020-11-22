import { Mesh, Object3D, PlaneBufferGeometry, ShaderMaterial } from "three";

import vertexShader from "../../shaders/backdrop/vertex.vert";
import fragmentShader from "../../shaders/backdrop/fragment.frag";

const COLOR_SKIMMING_SPEED = 0.005;

const BD_PARAMS = [
  {
    scaleX: 1,
    scaleY: 0.8,
    translateX: -0.25,
    translateY: 0,
  },
  {
    scaleX: 1.4,
    scaleY: 1.2,
    translateX: 0.1,
    translateY: -0.2,
  },
  {
    scaleX: 2,
    scaleY: 1.5,
    translateX: 0,
    translateY: -0.1,
  },
];

class BackDrop {
  constructor(options) {
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: {
          value: options.seed,
        },
        uNoiseScale: {
          value: 1.85,
        },
        uNoiseAmount: {
          value: 0.045,
        },
        uBoxScale: {
          value: 0.337,
        },
        uBoxRadius: {
          value: 0.085,
        },
        uBoxSmoothness: {
          value: 0.004,
        },
        uColorMix: {
          value: 0,
        },
        uInvert: {
          value: false,
        },
      },
    });

    this.scaleX = options.scaleX;
    this.scaleY = options.scaleY;

    this.geometry = new PlaneBufferGeometry(
      options.bbox.width,
      options.bbox.height,
      1,
      1
    );

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(
      options.position.x + options.bbox.width * options.translateX,
      options.position.y + options.bbox.height * options.translateY,
      -2
    );

    this.mesh.scale.set(0, 0, 1);
  }
}

class BackDrops extends Object3D {
  constructor(options) {
    super(options);

    this.frameCount = 0;
    this.backdrops = [];

    options.screens.forEach((screen, i) => {
      const bd = new BackDrop({
        position: screen.center,
        bbox: screen.bbox,
        seed: i * 28965,
        scaleX: BD_PARAMS[i].scaleX,
        scaleY: BD_PARAMS[i].scaleY,
        translateX: BD_PARAMS[i].translateX,
        translateY: BD_PARAMS[i].translateY,
      });
      this.add(bd.mesh);
      this.backdrops.push(bd);
    });
  }

  update() {
    this.frameCount += 1;

    if (this.frameCount > 25) {
      this.shouldUpdateBackdropsFrame = true;
      this.frameCount = 0;
    }

    for (let i = 0; i < this.backdrops.length; i++) {
      // Update color
      this.backdrops[
        i
      ].mesh.material.uniforms.uColorMix.value += COLOR_SKIMMING_SPEED;
      if (this.backdrops[i].mesh.material.uniforms.uColorMix.value > 1) {
        this.backdrops[i].mesh.material.uniforms.uColorMix.value = 0;
      }

      // Update time
      if (this.shouldUpdateBackdropsFrame) {
        this.backdrops[i].mesh.material.uniforms.uTime.value++;
      }
    }

    this.shouldUpdateBackdropsFrame = false;
  }
}

export default BackDrops;
