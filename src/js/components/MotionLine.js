import {
  CatmullRomCurve3,
  Mesh,
  Object3D,
  Vector3,
  Line,
  BufferGeometry,
  LineBasicMaterial,
} from "three";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "threejs-meshline";
import displayDebugPoint from "../helpers/displayDebugPoint";
import map from "../map";

const MESHLINE_VERTICES_COUNT = 300; // The higher the smoother
const DEBUG = false;
const VERTICES = [
  [
    [-0.6, -0.1, -1],
    [-1, 0.05, -1],
    [-0.6, 0.3, -1],
    [0.6, 0.75, -1],
    [-1.5, 1.75, -1],
  ],
  [
    [-0.5, -0.75, -1],
    [-1, -0.4, -1],
    [-1, 0, -1],
    [-0.25, 0.3, -1],
    [0.6, 0.2, -1],
    [0.5, 0.1, -1],
    [-0.2, 0.1, -1],
    [-0.75, 1.5, -1],
  ],
  [
    [0.75, -1.5, -1],
    [1, -1.25, -1],
    [-1.5, -0.4, -1],
    [0, 0, -1],
  ],
];

class MotionLine extends Object3D {
  constructor(options) {
    super(options);
    this.zipbagWidth = options.zipbagWidth;
    this.zipbagHeight = options.zipbagHeight;
    this.screens = options.screens;
    this.init();
  }

  init() {
    const curvePoints = [];

    this.screens.forEach((screen, i) => {
      VERTICES[i].forEach(([x, y, z]) => {
        const vertice = new Vector3(
          screen.center.x + this.zipbagWidth * x,
          screen.center.y - this.zipbagHeight * y,
          z
        );

        if (DEBUG) {
          this.add(displayDebugPoint(vertice, 0xff00e3));
        }

        curvePoints.push(vertice);
      });
    });

    const curve = new CatmullRomCurve3(curvePoints);

    if (DEBUG) {
      const line = new Line(
        new BufferGeometry().setFromPoints(curve.getPoints(200)),
        new LineBasicMaterial({ color: 0xff00cb })
      );
      line.position.z = 1;
      this.add(line);
    }

    this.material = new MeshLineMaterial({
      color: 0x000000,
      lineWidth: 2,
      dashOffset: 1,
      dashArray: 1,
      dashRatio: 0.88,
    });
    this.geometry = new MeshLine();
    this.geometry.setVertices(curve.getPoints(MESHLINE_VERTICES_COUNT));
    this.mesh = new Mesh(this.geometry, this.material);
    this.add(this.mesh);
  }

  update(t) {
    const offset = map(
      t,
      0,
      1,
      1,
      -(1 - this.mesh.material.uniforms.dashRatio.value)
    );

    this.mesh.material.uniforms.dashOffset.value = offset;
  }
}

export default MotionLine;
