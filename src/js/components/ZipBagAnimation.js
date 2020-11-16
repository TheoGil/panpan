import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
  MathUtils,
  TextureLoader,
} from "three";
import { Flow } from "three/examples/jsm/modifiers/CurveModifier";
import Tweakpane from "tweakpane";

import ZipBag from "./ZipBag";
import MotionLine from "./MotionLine";
import Path from "./Path";
import map from "../map";

import zipBagtexture from "../../img/zipbag.png";

const DEBUG = false;

const PARAMS = {
  offset: 0,
  alphaTransition: 0,
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
    this.initGUI();
    */

    new TextureLoader().load(zipBagtexture, (texture) => {
      this.flow.object3D.material.uniforms.uTexture.value = texture;
    });
  }

  initZipBag() {
    this.zipbag = new ZipBag();
  }

  // @TODO UPDATE POINTS ON RESIZE
  initPath() {
    this.path = new Path({
      yOff: this.zipbag.height,
    });
    this.add(this.path);
  }

  initFlow() {
    this.flow = new Flow(this.zipbag.mesh);
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
    this.flow.uniforms.spineOffset.value = this.zipbag.height / 2;
  }

  setMaxFlowOffset() {
    // If the pathOffset uniform goes beyond this value,
    // The mesh will be strech from the end of the spine to the beginning of the spine.
    // Setting the pathOffset uniforms to this.maxFlowOffset will display the mesh exactly at the end of the spine.
    // We use toFixed to "round" the decimals just a tiny bit. Otherwise, the mesh will still wrap back to the spine starting point.
    this.maxFlowOffset = (
      1 -
      this.zipbag.height / this.flow.uniforms.spineLength.value
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
        this.zipbag.width,
        this.zipbag.height,
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
    this.normalizedZipBagHelperOffset = this.zipbag.height / length;

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

  updateAlphaTransition(scrollAmount) {
    let alphaTransitionProgress = 0;

    // We only update the animation progress when in the [0.5, 1.0] scroll range. this corresponds to the
    // interval between the second and third screen.
    // Outside of this range, we'll assume an alphaTransitionProgress of 0.
    const scrollRange = [0.5, 1];

    // Since we are staggering the animation of the stripes in the fragment shader,
    // when getting to a transitionProgress of 1, the first stripes might have reach their
    // desired width but not the last ones. Thats why we are increasing the range of the transition progress.
    // this value have been defined arbitrary by tweaking manually.
    const transitionRange = [0, 1.35];

    if (scrollAmount > scrollRange[0]) {
      alphaTransitionProgress = map(
        scrollAmount,
        scrollRange[0],
        scrollRange[1],
        transitionRange[0],
        transitionRange[1]
      );

      // Apply and inCubic easing to the transition progress.
      alphaTransitionProgress =
        alphaTransitionProgress *
        alphaTransitionProgress *
        alphaTransitionProgress;
    }

    this.flow.object3D.material.uniforms.uTransitionProgress.value = alphaTransitionProgress;
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

    this.gui
      .addInput(PARAMS, "alphaTransition", {
        min: 0,
        max: 1.3,
        step: 0.001,
      })
      .on("change", (progress) => {
        this.flow.object3D.material.uniforms.uTransitionProgress.value = progress;
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
