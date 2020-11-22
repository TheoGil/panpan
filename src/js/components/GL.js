import { Scene, OrthographicCamera, WebGLRenderer } from "three";
import OrbitControls from "orbit-controls-es6";
import map from "../map";
import ZipBagAnimation from "./ZipBagAnimation";

const DEBUG = false;

class GL {
  constructor() {
    this.canvasEl = document.getElementById("js-canvas");

    this.onScroll = this.onScroll.bind(this);
    this.render = this.render.bind(this);

    this.setScrollableHeight();
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.setRendererSize();
    this.addObjects();
    this.render();

    this.onScroll();

    document.addEventListener("scroll", this.onScroll);
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    this.camera.position.z = 10;

    if (DEBUG) {
      const oc = new OrbitControls(this.camera, this.renderer.domElement);
      oc.enableZoom = false;
    }
  }

  initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvasEl,
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0xffffff, 0);
  }

  setRendererSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setCameraFrustrum() {
    this.camera.left = window.innerWidth / -2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = window.innerHeight / -2;
    this.camera.updateProjectionMatrix();
  }

  setScrollableHeight() {
    this.scrollableHeight = document.body.scrollHeight - window.innerHeight;
  }

  onScroll() {
    this.zipBagAnimation.onScroll(window.scrollY / this.scrollableHeight);
    this.updateCameraPosition();
  }

  onResize(reset) {
    this.setCameraFrustrum();
    this.setRendererSize();
    this.setScrollableHeight();

    if (reset) {
      this.reset();
    }
  }

  updateCameraPosition() {
    const screensCount = document.querySelectorAll(".js-zipbag").length;
    const threeSceneHeight =
      this.scrollableHeight +
      this.zipBagAnimation.path.yOff * (screensCount - 1);

    const cameraPositionYMax = -threeSceneHeight;

    this.camera.position.y = map(
      window.scrollY,
      0,
      this.scrollableHeight,
      0,
      cameraPositionYMax
    );
  }

  addObjects() {
    this.zipBagAnimation = new ZipBagAnimation({
      camera: this.camera,
    });
    this.scene.add(this.zipBagAnimation);
  }

  // Disclaimer:
  // This is not the ideal approach as it implies a lot of computation to instanciate
  // materials, geomtries (etc.) and could easely lead to memory issues.
  // A more opimized solution would be to update exisiting stuff instead of destroying and re-instanciating them.
  // I'm using settling for this because it is easier to implement and this project is only an experimentation "for fun".
  // This solution should not be used in a production project.
  reset() {
    this.zipBagAnimation.dispose();
    this.scene.remove(this.zipBagAnimation);
    this.zipBagAnimation = new ZipBagAnimation({
      camera: this.camera,
    });
    this.scene.add(this.zipBagAnimation);
  }

  render() {
    requestAnimationFrame(this.render);

    this.zipBagAnimation.update();

    this.renderer.render(this.scene, this.camera);
  }
}

export default GL;
