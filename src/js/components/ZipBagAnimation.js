import { Object3D, TextureLoader } from "three";
import lerp from "lerp";

import Tweakpane from "tweakpane";
import ZipBag from "./ZipBag";
import ZipBagHelper from "./ZipBagHelper";
import MotionLine from "./MotionLine";
import Flow from "./Flow";
import Path from "./Path";
import Ingredients from "./Ingredients";

import zipBagtexture from "../../img/zipbag_photo_x4.png";

const PARAMS = {
  offset: 0,
  alphaTransition: 0,
};
const LERP_TRESHOLD = 0.001;
const LERP_FACTOR = 0.2;

class ZipBagAnimation extends Object3D {
  constructor() {
    super();

    this.needsUpdate = false;
    this.scrollAmountTarget = 0;
    this.scrollAmount = 0;
    this.debugMeshes = [];

    this.initZipBag();
    this.initPath();
    this.initFlow();
    this.initMotionLine();
    this.initZipBagHelper();
    this.initIngredients();

    /*
    this.initGUI();
    */

    new TextureLoader().load(zipBagtexture, (texture) => {
      this.flow.cm.object3D.material.uniforms.uTexture.value = texture;
    });
  }

  initZipBag() {
    this.zipbag = new ZipBag();
  }

  initPath() {
    this.path = new Path({
      yOff: this.zipbag.height,
    });
    this.add(this.path);
  }

  initFlow() {
    this.flow = new Flow({
      mesh: this.zipbag.mesh,
      curvePath: this.path.curvePath,
      zipBagHeight: this.zipbag.height,
    });
    this.add(this.flow);
  }

  initZipBagHelper() {
    // NOTE :
    // The position helper is and Object3D that will visually follow the zipbag as it is displaced along the curve
    // This helper exists because the zipbag position is updated from a vertex shader in the GPU, thus, its modified positioned
    // cannot be retrieved in JS on the CPU.
    // We'll use this helper to get the position of the zipbag.
    // Why not just move the zipbag the same way we are moving the helper ? Because the vertex shader, in addition to moving the mesh along the curve also displace it along the curve.
    this.helper = new ZipBagHelper({
      width: this.zipbag.width,
      height: this.zipbag.height,
      path: this.path.curvePath,
    });
    this.add(this.helper);
  }

  initIngredients() {
    this.ingredients = new Ingredients();
    this.helper.add(this.ingredients);
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
      zipbagWidth: this.zipbag.width,
      zipbagHeight: this.zipbag.height,
      screens: this.path.screens,
    });
    this.add(this.motionLine);
  }

  onScroll(scrollAmount) {
    this.scrollAmountTarget = scrollAmount;
    this.needsUpdate = true;
  }

  update() {
    if (this.needsUpdate) {
      if (
        Math.abs(this.scrollAmountTarget - this.scrollAmount) > LERP_TRESHOLD
      ) {
        this.scrollAmount = lerp(
          this.scrollAmount,
          this.scrollAmountTarget,
          LERP_FACTOR
        );
      } else {
        this.scrollAmount = this.scrollAmountTarget;
        this.needsUpdate = false;
      }

      this.flow.update(this.scrollAmount);
      this.helper.update(this.scrollAmount);
      this.ingredients.update(this.scrollAmount);
      this.motionLine.update(this.scrollAmount);
    }
  }

  dispose() {
    this.zipbag.dispose();
    this.path.dispose();
    this.flow.dispose();
    this.motionLine.dispose();
    this.helper.dispose();
    this.ingredients.dispose();
  }
}

export default ZipBagAnimation;
