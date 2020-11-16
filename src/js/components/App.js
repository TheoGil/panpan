import { Scene, OrthographicCamera, WebGLRenderer } from "three";
import OrbitControls from "orbit-controls-es6";
import { debounce } from "throttle-debounce";
import map from "../map";
import ZipBagAnimation from "./ZipBagAnimation";

const DEBUG = false;

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    // this.debounceResize = debounce(200, this.debounceResize.bind(this));
    this.render = this.render.bind(this);

    // @TODO UPDATE ON RESIZE
    this.scrollableHeight = document.body.scrollHeight - window.innerHeight;

    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.setRendererSize();
    this.addObjects();

    document.addEventListener("scroll", this.onScroll);

    this.render();
    /*
    window.addEventListener("resize", debounce(200, this.onResize));
    */
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
      canvas: document.getElementById("js-canvas"),
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

  onResize() {
    this.setCameraFrustrum();
    this.setRendererSize();
    this.zipBagAnimation.updateCurve();
  }

  onScroll() {
    const scrollAmount = window.scrollY / this.scrollableHeight;

    this.updateZipBagPosition();

    this.zipBagAnimation.updateZipBagHelper(scrollAmount);

    this.zipBagAnimation.updateAlphaTransition(scrollAmount);

    this.updateCameraPosition();
  }

  updateCameraPosition() {
    // CAMERA ALWAYS FOLLOW HELPER
    // this.camera.position.y = this.zipBagAnimation.zipBagHelper.position.y;

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

  updateZipBagPosition() {
    this.zipBagAnimation.flow.uniforms.pathOffset.value = map(
      window.scrollY,
      0,
      this.scrollableHeight,
      0,
      this.zipBagAnimation.maxFlowOffset
    );
  }

  updateFoodPosition() {
    this.zipBagAnimation.food.update(
      window.scrollY / (document.body.scrollHeight - window.innerHeight)
    );
  }

  updateZipBagMotionLines() {
    const offset = map(
      window.scrollY,
      0,
      document.body.scrollHeight - window.innerHeight,
      1,
      -(
        1 -
        this.zipBagAnimation.motionLine.mesh.material.uniforms.dashRatio.value
      )
    );
    this.zipBagAnimation.motionLine.mesh.material.uniforms.dashOffset.value = offset;
  }

  addObjects() {
    this.zipBagAnimation = new ZipBagAnimation({
      camera: this.camera,
    });
    this.scene.add(this.zipBagAnimation);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
