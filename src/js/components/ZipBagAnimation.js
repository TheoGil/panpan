import { Object3D, TextureLoader } from "three";
import lerp from "lerp";

import Tweakpane from "tweakpane";
import ZipBag from "./ZipBag";
import ZipBagHelper from "./ZipBagHelper";
import MotionLine from "./MotionLine";
import Flow from "./Flow";
import Path from "./Path";
import Ingredients from "./Ingredients";
import Frame from "./Frame";
import BackDrops from "./BackDrops";

import zipBagtexture from "../../img/zipbag_photo_x4.png";

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
    this.initBackDrops();
    this.initFlow();
    this.initMotionLine();
    this.initZipBagHelper();
    this.initIngredients();
    this.initFrame();

    // this.initGUI();

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

  initBackDrops() {
    this.backdrops = new BackDrops({
      screens: this.path.screens,
    });
    this.add(this.backdrops);
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

    this.gui.addInput(this.frame.mesh.material.uniforms.uNoiseScale, "value", {
      label: "n scale",
      min: 0,
      max: 5,
      step: 0.001,
    });

    this.gui.addInput(this.frame.mesh.material.uniforms.uNoiseAmount, "value", {
      label: "n amount",
      min: 0,
      max: 0.05,
      step: 0.001,
    });

    this.gui.addInput(this.frame.mesh.material.uniforms.uBoxScale, "value", {
      label: "scale",
      min: 0.4,
      max: 0.5,
      step: 0.001,
    });

    this.gui.addInput(this.frame.mesh.material.uniforms.uBoxRadius, "value", {
      label: "radius",
      min: 0,
      max: 1,
      step: 0.001,
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

  initFrame() {
    this.frame = new Frame();
    this.add(this.frame);
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

    this.backdrops.update();
    this.frame.update();
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
