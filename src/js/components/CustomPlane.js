import {
  PlaneGeometry,
  PlaneBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector2,
  CubicBezierCurve,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  CatmullRomCurve3,
  Vector3,
  MeshStandardMaterial,
  DoubleSide,
  MathUtils,
  ShaderMaterial,
  LineCurve3,
  CubicBezierCurve3,
  Curve,
  CurvePath,
} from "three";
import { Flow } from "../CurveModifier";
import Tweakpane from "tweakpane";
import vertexShader from "../../shaders/customplane/vertex.vert";
import fragmentShader from "../../shaders/customplane/fragment.frag";

/**
 * @param {DOMRect} BCR
 * @return {Vector2}
 */
function DOMToTHREE(BCR) {
  const x = BCR.x + BCR.width / 2 - window.innerWidth / 2;
  let y = BCR.y + BCR.height / 2 - window.innerHeight / 2;
  return new Vector2(x, -y);
}

class CustomPlane extends Object3D {
  constructor() {
    super();

    this.verticalOffset = 0;

    this.PARAMS = {
      offset: 0,
    };
    this.gui = new Tweakpane();
    this.gui
      .addInput(this.PARAMS, "offset", {
        min: 0.028,
        max: 0.812,
        step: 0.001,
      })
      .on("change", (value) => {
        this.flow.setOffset(value);
      });

    this.initZipBag();
    this.initScreens();
    // this.initCurve();
    this.computeCurve();
    this.initFlow();
  }

  initScreens() {
    /*
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const geometry = new PlaneGeometry(
      window.innerWidth,
      window.innerHeight + 434 / 2,
      1,
      1
    );

    this.screen1Mesh = new Mesh(geometry, material);
    this.add(this.screen1Mesh);
    this.screen1Mesh.position.y = -434/2;


    this.screen2Mesh = new Mesh(geometry, material);
    this.screen2Mesh.position.y = -window.innerHeight - 434 /2;
    this.add(this.screen2Mesh);
    */
  }

  displayDebugPoint(pt, color = 0xff0000, size = 20) {
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ color })
    );
    mesh.position.set(pt.x, pt.y, 1);
    this.add(mesh);
  }

  initZipBag() {
    const DOMNode = document.querySelector(".js-zipbag");
    const BCR = DOMNode.getBoundingClientRect();

    // Compute zipbag dimensions based on its reference DOM node
    const width = BCR.width;
    const height = BCR.height;

    const geometry = new PlaneGeometry(
      width,
      height,
      1, // Arbitrary number
      20 // Arbitrary number
    );
    const material = new MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
      side: DoubleSide,
    });

    this.zipBagMesh = new Mesh(geometry, material);

    this.verticalOffset = height;
  }

  computeCurve() {
    const zipBagPositions = document.querySelectorAll(".js-zipbag-position");
    const screens = [];
    zipBagPositions.forEach((el, i) => {
      const BCR = el.getBoundingClientRect();
      const verticalOffset = i * this.verticalOffset;

      const zipBagTop = new Vector3(
        BCR.x + BCR.width / 2 - window.innerWidth / 2,
        -(BCR.y - window.innerHeight / 2) - verticalOffset,
        0
      );

      const zipBagBottom = new Vector3(
        zipBagTop.x,
        zipBagTop.y - BCR.height,
        0
      );

      // The bezier handle position computation change a bit based on wether we are on a even on
      let bezierHandle = new Vector3(zipBagTop.x, 0, 0);
      const screenIndexIsEven = i % 2 === 0;
      if (screenIndexIsEven) {
        bezierHandle.y = zipBagBottom.y - this.verticalOffset; 
      } else {
        bezierHandle.y = zipBagTop.y + this.verticalOffset; 
      }

      // this.displayDebugPoint(zipBagTop)
      // this.displayDebugPoint(zipBagBottom)
      // this.displayDebugPoint(bezierHandle, 0x00ff00)

      screens.push({ zipBagTop, zipBagBottom, bezierHandle });
    });

    
    const c1 = new LineCurve3(screens[0].zipBagTop, screens[0].zipBagBottom);
    const c2 = new CubicBezierCurve3(
      screens[0].zipBagBottom,
      screens[0].bezierHandle,
      screens[1].bezierHandle,
      screens[1].zipBagTop,
    );
    const c3 = new LineCurve3(
      screens[1].zipBagTop,
      screens[1].zipBagBottom
    );
      
    this.curvePath = new CurvePath();
    this.curvePath.curves = [c1, c2, c3];
    
    // ADD LINE TO SCENE TO VISUALISE THE CURVE
    /*
    const points = this.curvePath.getPoints(50);
    const line = new Line(
      new BufferGeometry().setFromPoints(points),
      new LineBasicMaterial({ color: 0x0000ff })
    );
    this.add(line);
    */
  }

  initFlow() {
    this.flow = new Flow(this.zipBagMesh);
    this.flow.updateCurve(0, this.curvePath);
    this.flow.object3D.rotation.x = MathUtils.degToRad(90);
    this.flow.object3D.rotation.z = MathUtils.degToRad(90);

    // Important!
    // The position of the object is not updated by the curveModifier
    // so it will disapear at some point when scrolling down the page
    // because the vertices on wich the fustrum culling is computed are the
    // original (before curve modification is applid) mesh vertices
    this.flow.object3D.frustumCulled = false;

    this.add(this.flow.object3D);
    this.flow.setOffset(0.028);
  }
}

export default CustomPlane;