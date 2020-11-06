import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector2,
} from "three";

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

    this.initScreens();
    this.initZipBag();
  }

  initScreens() {
    const material = new MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    const geometry = new PlaneGeometry(
      window.innerWidth,
      window.innerHeight,
      1,
      1
    );

    this.screen1Mesh = new Mesh(geometry, material);
    this.add(this.screen1Mesh);

    this.screen2Mesh = new Mesh(geometry, material);
    this.screen2Mesh.position.y = -window.innerHeight;
    this.add(this.screen2Mesh);
  }

  displayDebugPoint(x, y) {
    const mesh = new Mesh(
      new PlaneGeometry(10, 10),
      new MeshBasicMaterial({ color: 0xff0000 })
    );
    mesh.position.set(x, y);
    this.add(mesh);
  }

  initZipBag() {
    // Compute the positions of the zipbag on the various screens
    const positions = [];
    const zipBagPositions = document.querySelectorAll(".js-zipbag-position");
    zipBagPositions.forEach((el) => {
      const BCR = el.getBoundingClientRect();
      const position = DOMToTHREE(BCR);

      // DEBUG
      this.displayDebugPoint(position.x, position.y);

      positions.push(position);
    });

    const DOMNode = document.querySelector(".js-zipbag");
    const BCR = DOMNode.getBoundingClientRect();

    // Compute zipbag dimensions based on its reference DOM node
    const width = BCR.width;
    const height = BCR.height;

    const geometry = new PlaneGeometry(
      width,
      height,
      10, // Arbitrary number
      10 // Arbitrary number
    );
    const material = new MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    this.zipBagMesh = new Mesh(geometry, material);
    this.zipBagMesh.position.set(positions[0].x, positions[0].y);
    // console.log(this.zipBagMesh, positions[0].x, positions[0].y);
    this.add(this.zipBagMesh);
  }
}

export default CustomPlane;
