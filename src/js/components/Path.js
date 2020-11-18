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

    // The more the bezier handles are far away from the previous point, the less stiffer the curve will be
    // Setting it to the zipBag height is juuuust right *chef kiss* 👨‍🍳👌
    this.yOff = options.yOff;

    this.screens = [];

    this.computePathPointsPerScreen();
    this.buildPath();
  }

  computePathPointsPerScreen() {
    const zipBagCollection = document.querySelectorAll(".js-zipbag");
    zipBagCollection.forEach((el, i) => {
      const BCR = el.getBoundingClientRect();

      const screen = {};

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
        BCR.x + BCR.width / 2 - window.innerWidth / 2,
        -(BCR.y - window.innerHeight / 2) - yOff,
        0
      );
      if (DEBUG) {
        this.add(displayDebugPoint(screen.top));
      }

      // Point located at the center of the zipbag -> [50%, 50%]
      // We don't need this point to build the actual path that will be used by the curve modifier
      // but we'll use it as a reference when building the motionlines later on.
      screen.center = new Vector3(
        screen.top.x,
        screen.top.y - BCR.height / 2,
        0
      );
      if (DEBUG) {
        this.add(displayDebugPoint(screen.center, 0x0000ff));
      }

      // Point located at the very bottom of the zipbag, centered horizontaly -> [50%, 100%]
      screen.bottom = new Vector3(screen.top.x, screen.top.y - BCR.height, 0);
      if (DEBUG) {
        this.add(displayDebugPoint(screen.bottom));
      }

      // No need to compute handle1 for the first screen
      if (i > 0) {
        screen.handle1 = new Vector3(
          screen.top.x,
          screen.top.y + this.yOff, // Do not mix up this.yOff and yOff
          0
        );
        if (DEBUG) {
          this.add(displayDebugPoint(screen.handle1, 0x00ff00));
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
          this.add(displayDebugPoint(screen.handle2, 0x00ff00));
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

    this.curvePath = new CurvePath();
    this.curvePath.curves = curves;

    if (DEBUG) {
      const line = new Line(
        new BufferGeometry().setFromPoints(this.curvePath.getPoints(50)),
        new LineBasicMaterial({ color: 0x000000 })
      );
      line.position.z = 1;
      this.add(line);
    }
  }

  init() {
    this.screens = [];

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
        this.displayDebugPoint(bezierHandle, 0x00ff00);
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
}

export default Path;
