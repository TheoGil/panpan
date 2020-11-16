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

const INGREDIENTS = [
  {
    texture: salmonTexture,
    width: 800,
    height: 346,
    y: 180,
  },
  {
    texture: peasTexture,
    width: 800,
    height: 253,
    y: 60,
  },
  {
    texture: blueberriesTexture,
    width: 800,
    height: 346,
    y: -50,
  },
  {
    texture: potatoTexture,
    width: 800,
    height: 346,
    y: -160,
  },
];

class Ingredients extends Object3D {
  constructor() {
    super();

    this.loader = new TextureLoader();
    this.meshes = [];
    this.maxScale = 0.3;
    this.minScale = 0;

    INGREDIENTS.forEach((ingredient) => {
      const mesh = new Mesh(
        new PlaneBufferGeometry(ingredient.width, ingredient.height, 1, 1),
        new MeshBasicMaterial({
          map: this.loader.load(ingredient.texture),
          transparent: true,
        })
      );

      mesh.position.y = ingredient.y;
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
}

export default Ingredients;
