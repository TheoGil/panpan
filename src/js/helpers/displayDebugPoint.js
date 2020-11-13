import { Mesh, PlaneBufferGeometry, MeshBasicMaterial } from "three";

function displayDebugPoint(pt, color = 0xff0000, size = 20) {
  const mesh = new Mesh(
    new PlaneBufferGeometry(size, size),
    new MeshBasicMaterial({ color })
  );
  mesh.position.set(pt.x, pt.y, 1);

  return mesh;
}

export default displayDebugPoint;
