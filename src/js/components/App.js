import { Scene, OrthographicCamera, WebGLRenderer } from "three";
import OrbitControls from "orbit-controls-es6";
import map from "../map";
import ZipBagAnimation from "./ZipBagAnimation";

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.render = this.render.bind(this);

    this.initScene();

    this.initRenderer();
    this.initCamera();
    this.setRendererSize();
    this.addObjects();

    this.render();

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
    const oc = new OrbitControls(this.camera, this.renderer.domElement);
    oc.enableZoom = false;
  }

  initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("js-canvas"),
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0xffffff, 0);
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    this.setRendererSize();
  }

  onScroll() {
    this.updateCameraPosition();
    this.updateZipBagPosition();
  }

  updateCameraPosition() {
    const screensCount = 2;

    const cameraPositionYMax = -(
      window.scrollY +
      (screensCount - 1) * this.zipBagAnimation.bezierHandlesOffset
    );

    this.camera.position.y = map(
      window.scrollY,
      0,
      document.body.scrollHeight - window.innerHeight,
      0,
      cameraPositionYMax
    );
  }

  updateZipBagPosition() {
    this.zipBagAnimation.flow.uniforms.pathOffset.value = map(
      window.scrollY,
      0,
      document.body.scrollHeight - window.innerHeight,
      0,
      this.zipBagAnimation.maxFlowOffset
    );
  }

  setRendererSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addObjects() {
    this.zipBagAnimation = new ZipBagAnimation();
    this.scene.add(this.zipBagAnimation);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
