import {
  BoxGeometry,
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from "three";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "threejs-meshline";

const DEBUG = false;

class MotionLine extends Object3D {
  constructor(options) {
    super(options);

    this.init(options.screens);
  }

  init() {
    const zipBagPositions = document.querySelectorAll(".js-zipbag-position");
    const vertices = [
      [
        [0.5, 0.5, -1],
        [-0.5, 1, 1],
        [1.25, 1.1, -1],
      ],
      [
        [-0.5, -0.75, -1],
        [1.5, -0.5, 1],
        [-0.5, 0, -1],
        [0.5, 0.5, -1],
      ],
    ];

    const curvePoints = [];

    // How stiff the curve will be
    // Setting it to the zipBag height is juuuust right *chef kiss* 👨‍🍳👌
    this.bezierHandlesOffset = 434;
    zipBagPositions.forEach((el, i) => {
      const verticalOffset = i * this.bezierHandlesOffset;
      const BCR = el.getBoundingClientRect();
      const origin = {
        x: BCR.x - window.innerWidth / 2,
        y: -(BCR.y - window.innerHeight / 2) - verticalOffset,
      };
      vertices[i].forEach(([x, y, z]) => {
        const vertice = new Vector3(
          origin.x + BCR.width * x,
          origin.y - BCR.height * y,
          z
        );

        if (DEBUG) {
          this.displayDebugPoint(vertice);
        }

        curvePoints.push(vertice);
      });
    });

    const curve = new CatmullRomCurve3(curvePoints);
    curve.curveType = "catmullrom";
    curve.tension = 1;

    this.material = new MeshLineMaterial({
      color: 0x000000,
      lineWidth: 2,
      dashOffset: 1,
      dashArray: 1,
      dashRatio: 0.88,
      transparent: true,
    });

    this.geometry = new MeshLine();
    this.geometry.setVertices(curve.getPoints(200));

    this.mesh = new Mesh(this.geometry, this.material);
    this.add(this.mesh);
    // this.updateGeometry();
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

export default MotionLine;
