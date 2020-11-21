import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  TextureLoader,
} from "three";

import salmonTexture from "../../img/ingredients/salmon.png";
import peasTexture from "../../img/ingredients/peas.png";
import blueberriesTexture from "../../img/ingredients/blueberries.png";
import potatoTexture from "../../img/ingredients/sweetpotato.png";
import map from "../map";

// All the ingredient textures share the same dimensions
const TEXTURE_WIDTH = 800;
const TEXTURE_HEIGHT = 346;

const INGREDIENTS = [
  {
    texture: salmonTexture,
    y: 0.4,
  },
  {
    texture: peasTexture,
    y: 0.125,
  },
  {
    texture: blueberriesTexture,
    y: -0.125,
  },
  {
    texture: potatoTexture,
    y: -0.4,
  },
];

class Ingredients extends Object3D {
  constructor(options) {
    super();

    this.loader = new TextureLoader();
    this.meshes = [];
    this.maxScale = options.zipBagWidth / TEXTURE_WIDTH;
    this.minScale = 0;

    INGREDIENTS.forEach((ingredient) => {
      const mesh = new Mesh(
        new PlaneBufferGeometry(TEXTURE_WIDTH, TEXTURE_HEIGHT, 1, 1),
        new MeshBasicMaterial({
          map: this.loader.load(ingredient.texture),
          transparent: true,
        })
      );

      mesh.position.y = ingredient.y * options.zipBagHeight;
      mesh.position.z = -1; // Ingredient should appear behind zipbag
      mesh.scale.set(0.3, 0.3, 1);
      mesh.material.opacity = 0;

      this.meshes.push(mesh);
      this.add(mesh);
    });
  }

  update(scrollAmount) {
    let t = 0;

    // We only handle the ingredients animation within the [0.5, 1.0] scroll range.
    // This corresponds to the interval between the second and third screen.
    // Outside of this range, we'll assume an t of 0.
    const scrollRange = [0.5, 1];

    if (scrollAmount > scrollRange[0]) {
      t = (scrollAmount - 0.5) * 2;

      const scale = map(t, 0, 1, this.minScale, this.maxScale);

      for (let i = 0; i < this.meshes.length; i++) {
        this.meshes[i].material.opacity = t;
        this.meshes[i].scale.set(scale, scale, 1);
      }
    }
  }

  dispose() {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].material.map.dispose();
      this.meshes[i].material.dispose();
      this.meshes[i].geometry.dispose();
    }
  }
}

export default Ingredients;
