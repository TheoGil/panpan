import { Mesh, Object3D, PlaneBufferGeometry, ShaderMaterial } from "three";

import vertexShader from "../../shaders/zipbag/vertex.vert";
import fragmentShader from "../../shaders/zipbag/fragment.frag";

class ZipBag extends Object3D {
  constructor() {
    super();

    this.initMesh();
  }

  initMesh() {
    const DOMNode = document.querySelector(".js-zipbag");

    // Compute zipbag dimensions based on its reference DOM node
    const bbox = DOMNode.getBoundingClientRect();
    this.width = bbox.width;
    this.height = bbox.height;

    const widthSegments = 1; // Visually looks good, feel free to change if needed
    const heightSegments = 20; // Visually looks good, feel free to change if needed

    const geometry = new PlaneBufferGeometry(
      this.width,
      this.height,
      widthSegments,
      heightSegments
    );

    const material = new ShaderMaterial({
      // wireframe: true,
      transparent: true,
      uniforms: {
        uTexture: {
          type: "t",
          value: null,
        },
        uTransitionProgress: {
          value: 0,
        },
      },
      vertexShader,
      fragmentShader,
    });

    this.mesh = new Mesh(geometry, material);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default ZipBag;
