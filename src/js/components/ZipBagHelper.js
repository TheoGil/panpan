import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Vector3,
} from "three";
import map from "../map";

const DEBUG = false;

class ZipBagHelper extends Object3D {
  constructor(options) {
    super(options);

    this.height = options.height; // @TODO UPDATE ON RESIZE
    this.width = options.width; // @TODO UPDATE ON RESIZE
    this.path = options.path;

    this.init();
  }

  init() {
    if (DEBUG) {
      const geometry = new PlaneBufferGeometry(this.width, this.height, 10, 10);

      const material = new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });

      this.mesh = new Mesh(geometry, material);
    } else {
      this.mesh = new Object3D();
    }

    this.add(this.mesh);

    // In order to position the helper right over the actual zipbag, we need to offset it by half its height.
    // To speak in normalized ccordinates, it needs to go from [0.0, 0.5] to [0.5, 0.5].
    this.normalizedZipBagHelperOffset = this.height / this.path.getLength() / 2; // @TODO UPDATE ON RESIZE

    // Will be used to compute orientation
    this.up = new Vector3(0, -1, 0);
    this.axis = new Vector3();

    this.update(0);
  }

  update(t) {
    const newT = map(
      t,
      0,
      1,
      this.normalizedZipBagHelperOffset,
      1 - this.normalizedZipBagHelperOffset
    );

    // Set new orientation
    // Credit 🡒 https://observablehq.com/@rveciana/three-js-object-moving-object-along-path
    const tangent = this.path.getTangentAt(newT).normalize();
    this.axis.crossVectors(this.up, tangent).normalize();
    const radians = Math.acos(this.up.dot(tangent));
    this.quaternion.setFromAxisAngle(this.axis, radians);

    // Set new position
    this.position.copy(this.path.getPointAt(newT));
  }
}

export default ZipBagHelper;
