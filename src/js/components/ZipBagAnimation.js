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
  CatmullRomCurve3,
} from "three";
import { Flow } from "three/examples/jsm/modifiers/CurveModifier";
// import { Flow } from "../CurveModifier";
import Tweakpane from "tweakpane";
import MotionLine from "./MotionLine";
import vertexShader from "../../shaders/zipbag/vertex.vert";
import fragmentShader from "../../shaders/zipbag/fragment.frag";
import zipBagtexture from "../../img/zipbag.png";
import map from "../map";

const DEBUG = false;

const PARAMS = {
  offset: 0,
};

class CustomPlane extends Object3D {
  constructor() {
    super();

    this.debugMeshes = [];

    this.initZipBag();
    this.initFlowCurve();
    this.initFlow();
    this.initZipBagHelper();
    this.initMotionLine();
    // this.initGUI();

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

  initFlowCurve() {
    this.screens = [];

    // How stiff the curve will be
    // Setting it to the zipBag height is juuuust right *chef kiss* 👨‍🍳👌
    this.bezierHandlesOffset = this.zipBagHeight;

    const zipBagPositions = document.querySelectorAll(".js-zipbag");
    zipBagPositions.forEach((el, i) => {
      const bbox = el.getBoundingClientRect();

      const verticalOffset = i * this.bezierHandlesOffset;

      const zipBagTop = new Vector3(
        bbox.x + bbox.width / 2 - window.innerWidth / 2,
        -(bbox.y - window.innerHeight / 2) - verticalOffset,
        0
      );

      const zipBagBottom = new Vector3(
        zipBagTop.x,
        zipBagTop.y - bbox.height,
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

      if (DEBUG) {
        this.displayDebugPoint(
          new Vector3(zipBagTop.x, zipBagTop.y - bbox.height / 2, 1),
          0xff0000
        ); // Center
        this.displayDebugPoint(zipBagTop, 0x0000ff);
        this.displayDebugPoint(zipBagBottom, 0x0000ff);
        // this.displayDebugPoint(bezierHandle, 0x00ff00);
      }

      this.screens.push({ zipBagTop, zipBagBottom, bezierHandle });
    });

    const c1 = new LineCurve3(
      this.screens[0].zipBagTop,
      this.screens[0].zipBagBottom
    );

    const c2 = new CubicBezierCurve3(
      this.screens[0].zipBagBottom,
      this.screens[0].bezierHandle,
      this.screens[1].bezierHandle,
      this.screens[1].zipBagTop
    );

    const c3 = new LineCurve3(
      this.screens[1].zipBagTop,
      this.screens[1].zipBagBottom
    );

    this.curvePath = new CurvePath();
    this.curvePath.curves = [c1, c2, c3];

    if (DEBUG) {
      const points = this.curvePath.getPoints(50);
      const line = new Line(
        new BufferGeometry().setFromPoints(points),
        new LineBasicMaterial({ color: 0x0000ff })
      );
      line.position.z = 1;
      this.add(line);
      this.debugMeshes.push(line);
    }
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
    ).toFixed(3);
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
    const length = this.curvePath
      .getCurveLengths()
      .reduce((previousValue, currentValue) => previousValue + currentValue);
    const lengthMinusHeight = length - this.zipBagHeight;
    this.normalizedZipBagHelperOffset = 1 - lengthMinusHeight / length;

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

    const newPos = this.curvePath.getPoint(t);
    this.zipBagHelper.position.set(newPos.x, newPos.y, newPos.z);

    // Compute rotation based on the curve angle at position t
    const tangent = this.curvePath.getTangent(t);
    const rotation = Math.acos(this.zipBagHelperAxis.dot(tangent));
    this.zipBagHelper.rotation.z = rotation;
  }

  updateCurve() {
    this.debugMeshes.forEach((mesh) => {
      this.remove(mesh);
    });
    this.debugMeshes = [];

    // Compute the new zipbag dimensions
    const DOMNode = document.querySelector(".js-zipbag");
    const bbox = DOMNode.getBoundingClientRect();
    this.zipBagWidth = bbox.width;
    this.zipBagHeight = bbox.height;

    // Recompute the curve, based on the new zipbags dimensions and positions
    this.initFlowCurve();
    this.flow.updateCurve(0, this.curvePath);

    this.setSpineOffset();
    this.setMaxFlowOffset();
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

    this.gui.addInput(
      this.motionLine.mesh.material.uniforms.dashOffset,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "dashOffset",
      }
    );

    this.gui.addInput(
      this.motionLine.mesh.material.uniforms.dashArray,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "dashArray",
      }
    );

    this.gui.addInput(
      this.motionLine.mesh.material.uniforms.dashRatio,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "dashRatio",
      }
    );
  }

  displayDebugPoint(pt, color = 0xff0000, size = 20) {
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ color })
    );
    mesh.position.set(pt.x, pt.y, 1);
    this.add(mesh);
    this.debugMeshes.push(mesh);
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
