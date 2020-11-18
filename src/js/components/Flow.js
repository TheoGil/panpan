import { MathUtils, Object3D } from "three";
import { Flow as CurveModifier } from "three/examples/jsm/modifiers/CurveModifier";
import map from "../map";

class Flow extends Object3D {
  constructor(options) {
    super(options);
    this.init(options);
  }

  init(options) {
    this.zipBagHeight = options.zipBagHeight;
    this.cm = new CurveModifier(options.mesh);
    this.cm.updateCurve(0, options.curvePath);

    // The curve modifier will automaticaly apply a rotation to our mesh
    // Here we reverse this rotation so the zipbag mesh face the camera
    this.cm.object3D.rotation.x = MathUtils.degToRad(90);
    this.cm.object3D.rotation.z = MathUtils.degToRad(90);

    // Important!
    // The position of the object is not updated per se by the curveModifier
    // so it will disapear at some point when scrolling down the page
    // because the vertices on wich the fustrum culling is computed are the
    // original (before curve modification is applid) mesh vertices
    this.cm.object3D.frustumCulled = false;

    this.setSpineOffset();

    this.setMaxFlowOffset();

    this.add(this.cm.object3D);
  }

  setSpineOffset() {
    // Sets the default mesh offset alongside the spine
    // This ensure that when setting the pathOffset uniforms to 0, the mesh is displayed exactly at the begining of the spine.
    this.cm.uniforms.spineOffset.value = this.zipBagHeight / 2;
  }

  setMaxFlowOffset() {
    // If the pathOffset uniform goes beyond this value,
    // The mesh will be strech from the end of the spine to the beginning of the spine.
    // Setting the pathOffset uniforms to this.maxFlowOffset will display the mesh exactly at the end of the spine.
    // We use toFixed to "round" the decimals just a tiny bit. Otherwise, the mesh will still wrap back to the spine starting point.
    this.maxFlowOffset = (
      1 -
      this.zipBagHeight / this.cm.uniforms.spineLength.value
    ).toFixed(2);
  }

  update(progress) {
    this.updatePathOffset(progress);
    this.updateAlphaTransition(progress);
  }

  updatePathOffset(progress) {
    this.cm.uniforms.pathOffset.value = progress * this.maxFlowOffset;
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

    this.cm.object3D.material.uniforms.uTransitionProgress.value = alphaTransitionProgress;
  }

  dipose() {
    this.cm.object3D.material.dispose();
    this.cm.object3D.geometry.dispose();
  }
}

export default Flow;
