import {
  Vector3,
  Object3D,
  LineCurve3,
  CubicBezierCurve3,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  CurvePath,
} from "three";
import displayDebugPoint from "../helpers/displayDebugPoint";

const DEBUG = false;

class Path extends Object3D {
  constructor(options) {
    super(options);

    this.debugMeshes = [];
    this.curvePath = new CurvePath();
    this.screens = [];

    // The more the bezier handles are far away from the previous point, the less stiffer the curve will be
    // Setting it to the zipBag height is juuuust right *chef kiss* 👨‍🍳👌
    this.yOff = options.yOff;

    this.computePathPointsPerScreen();
    this.buildPath();
  }

  computePathPointsPerScreen() {
    const zipBagCollection = document.querySelectorAll(".js-zipbag");
    zipBagCollection.forEach((el, i) => {
      const screen = {};
      screen.bbox = el.getBoundingClientRect();

      // In order to soften the stiffness of the bezier curves between screens,
      // we're offseting every point by a defined amount on the Y axis.
      // This will strech the curve and result in a smoother path.
      // The downside of the solution is that the positions of the DOM nodes
      // and their Three counterparts are no longer the same. We'll have
      // to move the camera quicker than the scroll to compensate and create
      // the illusion that elements sits on the same plane.
      const yOff = i * this.yOff;

      // Point located at the very top of the zipbag, centered horizontaly -> [50%, 0%]
      screen.top = new Vector3(
        screen.bbox.x + screen.bbox.width / 2 - window.innerWidth / 2,
        -(screen.bbox.y - window.innerHeight / 2) - yOff - window.scrollY,
        0
      );
      if (DEBUG) {
        this.debugPoint(screen.top);
      }

      // Point located at the center of the zipbag -> [50%, 50%]
      // We don't need this point to build the actual path that will be used by the curve modifier
      // but we'll use it as a reference when building the motionlines later on.
      screen.center = new Vector3(
        screen.top.x,
        screen.top.y - screen.bbox.height / 2,
        0
      );
      if (DEBUG) {
        this.debugPoint(screen.center, 0x0000ff);
      }

      // Point located at the very bottom of the zipbag, centered horizontaly -> [50%, 100%]
      screen.bottom = new Vector3(
        screen.top.x,
        screen.top.y - screen.bbox.height,
        0
      );
      if (DEBUG) {
        this.debugPoint(screen.bottom);
      }

      // No need to compute handle1 for the first screen
      if (i > 0) {
        screen.handle1 = new Vector3(
          screen.top.x,
          screen.top.y + this.yOff, // Do not mix up this.yOff and yOff
          0
        );
        if (DEBUG) {
          this.debugPoint(screen.handle1, 0x00ff00);
        }
      }

      // No need to compute handle2 for the last screen
      if (i < zipBagCollection.length) {
        screen.handle2 = new Vector3(
          screen.top.x,
          screen.bottom.y - this.yOff, // Do not mix up this.yOff and yOff
          0
        );
        if (DEBUG) {
          this.debugPoint(screen.handle2, 0x00ff00);
        }
      }

      this.screens.push(screen);
    });
  }

  buildPath() {
    const curves = [];

    this.screens.forEach((screen, i) => {
      // Create a line that goes from the top to the bottom of the zipbag
      // It is necessary to incorporate this straight line into the final path,
      // otherwise, the mesh will deformed
      const line = new LineCurve3(screen.top, screen.bottom);
      curves.push(line);

      //   Then for every screen but the last one, create a bezier curve that connects the
      // bottom of current screen zipbag to the top of the next one
      if (i < this.screens.length - 1) {
        const bezier = new CubicBezierCurve3(
          screen.bottom,
          screen.handle2,
          this.screens[i + 1].handle1,
          this.screens[i + 1].top
        );
        curves.push(bezier);
      }
    });

    this.curvePath.curves = curves;

    if (DEBUG) {
      const line = new Line(
        new BufferGeometry().setFromPoints(this.curvePath.getPoints(50)),
        new LineBasicMaterial({ color: 0x000000 })
      );
      line.position.z = 1;
      this.debugMeshes.push(line);
      this.add(line);
    }
  }

  debugPoint(point, color) {
    const debug = displayDebugPoint(point, color);
    this.debugMeshes.push(debug);
    this.add(debug);
  }

  dispose() {
    if (DEBUG) {
      this.debugMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.remove(mesh);
      });
    }
  }
}

export default Path;
