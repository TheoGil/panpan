import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
  MathUtils,
  ShaderMaterial,
  LineCurve3,
  CubicBezierCurve3,
  CurvePath,
  TextureLoader,
  Line,
  BufferGeometry,
  LineBasicMaterial,
} from "three";
// import { Flow } from "three/examples/jsm/modifiers/CurveModifier";
import { Flow } from "../CurveModifier";
import Tweakpane from "tweakpane";
import vertexShader from "../../shaders/zipbag/vertex.vert";
import fragmentShader from "../../shaders/zipbag/fragment.frag";
import zipBagtexture from "../../img/zipbag.png";

const PARAMS = {
  offset: 0,
};

class CustomPlane extends Object3D {
  constructor() {
    super();

    this.initZipBag();
    this.initCurve();
    this.initFlow();
    this.initGUI();

    new TextureLoader().load(zipBagtexture, (texture) => {
      this.flow.object3D.material.uniforms.uTexture.value = texture;
      // this.flow.object3D.material.uniforms.uTexture.value.needsUpdate = true;
    });
  }

  initZipBag() {
    const DOMNode = document.querySelector(".js-zipbag");
    const BCR = DOMNode.getBoundingClientRect();

    // Compute zipbag dimensions based on its reference DOM node
    this.zipBagWidth = BCR.width;
    this.zipBagHeight = BCR.height;

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
      defines: {
        USE_UV: true,
      },
    });

    this.zipBagMesh = new Mesh(geometry, material);
  }

  initCurve() {
    // How stiff the curve will be
    // Setting it to the zipBag height is juuuust right *chef kiss* 👨‍🍳👌
    this.bezierHandlesOffset = this.zipBagHeight;

    const zipBagPositions = document.querySelectorAll(".js-zipbag-position");
    const screens = [];
    zipBagPositions.forEach((el, i) => {
      const BCR = el.getBoundingClientRect();
      const verticalOffset = i * this.bezierHandlesOffset;

      const zipBagTop = new Vector3(
        BCR.x + BCR.width / 2 - window.innerWidth / 2,
        -(BCR.y - window.innerHeight / 2) - verticalOffset,
        0
      );

      // ----- DEBUG
      this.displayDebugPoint(
        new Vector3(zipBagTop.x, zipBagTop.y - BCR.height / 2, 1),
        0x0000ff
      );
      // ----- DEBUG

      const zipBagBottom = new Vector3(
        zipBagTop.x,
        zipBagTop.y - BCR.height,
        0
      );

      // The bezier handle position computation change a bit based on wether we are on a even on
      let bezierHandle = new Vector3(zipBagTop.x, 0, 0);
      const screenIndexIsEven = i % 2 === 0;
      if (screenIndexIsEven) {
        bezierHandle.y = zipBagBottom.y - this.bezierHandlesOffset;
      } else {
        bezierHandle.y = zipBagTop.y + this.bezierHandlesOffset;
      }

      this.displayDebugPoint(zipBagTop, 0x0000ff);
      this.displayDebugPoint(zipBagBottom, 0x0000ff);
      this.displayDebugPoint(bezierHandle, 0x00ff00);

      screens.push({ zipBagTop, zipBagBottom, bezierHandle });
    });

    const c1 = new LineCurve3(screens[0].zipBagTop, screens[0].zipBagBottom);
    const c2 = new CubicBezierCurve3(
      screens[0].zipBagBottom,
      screens[0].bezierHandle,
      screens[1].bezierHandle,
      screens[1].zipBagTop
    );
    const c3 = new LineCurve3(screens[1].zipBagTop, screens[1].zipBagBottom);

    this.curvePath = new CurvePath();
    this.curvePath.curves = [c1, c2, c3];

    // ----- DEBUG
    // ADD LINE TO SCENE TO VISUALISE THE CURVE
    const points = this.curvePath.getPoints(50);
    const line = new Line(
      new BufferGeometry().setFromPoints(points),
      new LineBasicMaterial({ color: 0x0000ff })
    );
    line.position.z = 1;
    this.add(line);
    // ----- DEBUG
  }

  initFlow() {
    this.flow = new Flow(this.zipBagMesh);
    this.flow.updateCurve(0, this.curvePath);

    // The curve modifier will automaticaly apply a rotation to our mesh
    // Here we reverse this rotation so the zipbag mesh face the camera
    this.flow.object3D.rotation.x = MathUtils.degToRad(90);
    this.flow.object3D.rotation.z = MathUtils.degToRad(90);

    // Important!
    // The position of the object is not updated by the curveModifier
    // so it will disapear at some point when scrolling down the page
    // because the vertices on wich the fustrum culling is computed are the
    // original (before curve modification is applid) mesh vertices
    this.flow.object3D.frustumCulled = false;

    // Sets the default mesh offset alongside the spine
    // This ensure that when setting the pathOffset uniforms to 0, the mesh is displayed exactly at the begining of the spine.
    this.flow.uniforms.spineOffset.value = this.zipBagHeight / 2;

    // If the pathOffset uniform goes beyond this value,
    // The mesh will be strech from the end of the spine to the beginning of the spine.
    // Setting the pathOffset uniforms to this.maxFlowOffset will display the mesh exactly at the end of the spine.
    // We use toFixed to "round" the decimals just a tiny bit. Otherwise, the mesh will still wrap back to the spine starting point.
    this.maxFlowOffset = (
      1 -
      this.zipBagHeight / this.flow.uniforms.spineLength.value
    ).toFixed(3);

    this.add(this.flow.object3D);
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

  displayDebugPoint(pt, color = 0xff0000, size = 20) {
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ color })
    );
    mesh.position.set(pt.x, pt.y, 1);
    this.add(mesh);
  }
}

export default CustomPlane;
