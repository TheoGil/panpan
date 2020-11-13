import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
  MathUtils,
  ShaderMaterial,
  TextureLoader,
} from "three";
import { Flow } from "three/examples/jsm/modifiers/CurveModifier";
import Tweakpane from "tweakpane";

import MotionLine from "./MotionLine";
import Path from "./Path";
import map from "../map";

import vertexShader from "../../shaders/zipbag/vertex.vert";
import fragmentShader from "../../shaders/zipbag/fragment.frag";
import zipBagtexture from "../../img/zipbag.png";

const DEBUG = false;

const PARAMS = {
  offset: 0,
};

class CustomPlane extends Object3D {
  constructor(options) {
    super();

    this.debugMeshes = [];

    this.initZipBag();
    this.initPath();
    this.initFlow();
    this.initZipBagHelper();

    /*
    this.initMotionLine();
    */

    this.initGUI();

    new TextureLoader().load(zipBagtexture, (texture) => {
      this.flow.object3D.material.uniforms.uTexture.value = texture;
    });
  }

  initZipBag() {
    const DOMNode = document.querySelector(".js-zipbag");

    // Compute zipbag dimensions based on its reference DOM node
    const bbox = DOMNode.getBoundingClientRect();
    this.zipBagWidth = bbox.width;
    this.zipBagHeight = bbox.height;

    const widthSegments = 1; // Visually looks good, feel free to change if needed
    const heightSegments = 20; // Visually looks good, feel free to change if needed

    const geometry = new PlaneGeometry(
      this.zipBagWidth,
      this.zipBagHeight,
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
      },
      vertexShader,
      fragmentShader,
    });

    this.zipBagMesh = new Mesh(geometry, material);
  }

  // @TODO UPDATE POINTS ON RESIZE
  initPath() {
    this.path = new Path({
      yOff: this.zipBagHeight,
    });
    this.add(this.path);
  }

  initFlow() {
    this.flow = new Flow(this.zipBagMesh);
    this.flow.updateCurve(0, this.path.curvePath);

    // The curve modifier will automaticaly apply a rotation to our mesh
    // Here we reverse this rotation so the zipbag mesh face the camera
    this.flow.object3D.rotation.x = MathUtils.degToRad(90);
    this.flow.object3D.rotation.z = MathUtils.degToRad(90);

    // Important!
    // The position of the object is not updated per se by the curveModifier
    // so it will disapear at some point when scrolling down the page
    // because the vertices on wich the fustrum culling is computed are the
    // original (before curve modification is applid) mesh vertices
    this.flow.object3D.frustumCulled = false;

    this.setSpineOffset();

    this.setMaxFlowOffset();

    this.add(this.flow.object3D);
  }

  setSpineOffset() {
    // Sets the default mesh offset alongside the spine
    // This ensure that when setting the pathOffset uniforms to 0, the mesh is displayed exactly at the begining of the spine.
    this.flow.uniforms.spineOffset.value = this.zipBagHeight / 2;
  }

  setMaxFlowOffset() {
    // If the pathOffset uniform goes beyond this value,
    // The mesh will be strech from the end of the spine to the beginning of the spine.
    // Setting the pathOffset uniforms to this.maxFlowOffset will display the mesh exactly at the end of the spine.
    // We use toFixed to "round" the decimals just a tiny bit. Otherwise, the mesh will still wrap back to the spine starting point.
    this.maxFlowOffset = (
      1 -
      this.zipBagHeight / this.flow.uniforms.spineLength.value
    ).toFixed(2);
  }

  initZipBagHelper() {
    // NOTE :
    // The position helper is and Object3D that will visually follow the zipbag as it is displaced along the curve
    // This helper exists because the zipbag position is updated from a vertex shader in the GPU, thus, its modified positioned
    // cannot be retrieved in JS on the CPU.
    // We'll use this helper to get the position of the zipbag.
    // Why not just move the zipbag the same way we are moving the helper ? Because the vertex shader, in addition to moving the mesh along the curve also displace it along the curve.

    if (DEBUG) {
      const geometry = new PlaneGeometry(
        this.zipBagWidth,
        this.zipBagHeight,
        10,
        10
      );

      const material = new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });

      this.zipBagHelper = new Mesh(geometry, material);
    } else {
      this.zipBagHelper = new Object3D();
    }

    this.add(this.zipBagHelper);

    // Compute the offset amount for the follower to be positioned right on the center of the zipbag
    // Remember: the zipbag origin is [.5, 0] but the follower is [.5, .5]
    const length = this.path.curvePath
      .getCurveLengths()
      .reduce((previousValue, currentValue) => previousValue + currentValue);
    this.normalizedZipBagHelperOffset = this.zipBagHeight / length;

    this.zipBagHelperAxis = new Vector3(0, 1, 0);
  }

  updateZipBagHelper(amount) {
    const t = map(
      amount,
      0,
      1,
      this.normalizedZipBagHelperOffset,
      1 - this.normalizedZipBagHelperOffset
    );

    const newPos = this.path.curvePath.getPoint(t);
    this.zipBagHelper.position.set(newPos.x, newPos.y, newPos.z);

    // Compute rotation based on the curve angle at position t
    const tangent = this.path.curvePath.getTangent(t);
    const rotation = Math.acos(this.zipBagHelperAxis.dot(tangent));
    this.zipBagHelper.rotation.z = rotation;
  }

  initGUI() {
    this.gui = new Tweakpane();
    this.gui
      .addInput(PARAMS, "offset", {
        min: 0,
        max: this.maxFlowOffset,
        step: 0.001,
      })
      .on("change", (value) => {
        this.flow.uniforms.pathOffset.value = value;
      });
  }

  initMotionLine() {
    this.motionLine = new MotionLine({
      screens: this.screens,
      bezierHandlesOffset: this.bezierHandlesOffset,
    });
    this.add(this.motionLine);
  }
}

export default CustomPlane;
