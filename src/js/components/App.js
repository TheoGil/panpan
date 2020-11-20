import { debounce } from "throttle-debounce";
import A11yDialog from "a11y-dialog";
import GL from "./GL";

const BP = Number.parseInt(
  window.getComputedStyle(document.querySelector('meta[name="breakpoint"]'))
    .fontSize
);
const DEBOUNCE_AMOUNT = 200;

class App {
  constructor() {
    console.clear();

    this.onResize = debounce(DEBOUNCE_AMOUNT, this.onResize.bind(this));
    this.mobileDialog = new A11yDialog(
      document.getElementById("my-accessible-dialog")
    );

    if (window.innerWidth > BP) {
      this.initGL();
    } else {
      this.mobileDialog.show();
    }

    window.addEventListener("resize", this.onResize);
  }

  initGL() {
    this.gl = new GL();
  }

  onResize() {
    if (window.innerWidth > BP) {
      // If we go above BP and GL wasn't created yet, create it
      if (!this.gl) {
        this.initGL();
      }

      // If we go above BP and GL was killed, resurect it
      if (!this.gl.alive) {
        this.gl.resurect();
      }

      // If necessary hide dialog explaining that mobile won't feature the animation
      if (this.mobileDialog.shown) {
        this.mobileDialog.hide();
      }

      this.gl.onResize();
    } else {
      // If GL was existing and be go below BP, kill GL
      if (this.gl && this.gl.alive) {
        this.gl.kill();

        // If necessary show dialog to explain that mobile won't feature the animation
        if (!this.mobileDialog.shown) {
          this.mobileDialog.show();
        }
      }
    }
  }
}

export default App;
