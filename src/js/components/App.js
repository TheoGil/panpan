import { debounce } from "throttle-debounce";
import A11yDialog from "a11y-dialog";
import GL from "./GL";

const DEBOUNCE_AMOUNT = 200;
const RESIZE_HEIGHT_THRESHOLD = 100;

class App {
  constructor() {
    console.clear();

    this.previousInnerHeight = window.innerHeight;
    this.previousInnerWidth = window.innerWidth;

    this.setVh();
    this.gl = new GL();
    this.onResize = debounce(DEBOUNCE_AMOUNT, this.onResize.bind(this));

    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    // On mobile the browser showing or hiding the adress bar, will trigger a resize event
    // and thus reset the whold webgl scene (I know, not ideal, see the comment in the gl.reset method).
    // To prevent unnecessery computations and jumps in the animations, we'll prevent this by only
    // triggering the resize method IF the width change OR IF the height change more than the specified threshold.
    const reset =
      window.innerWidth !== this.previousInnerWidth ||
      Math.abs(window.innerHeight - this.previousInnerHeight) >
        RESIZE_HEIGHT_THRESHOLD;

    if (reset) {
      this.setVh();
    }

    this.gl.onResize(reset);
  }

  setVh() {
    this.previousInnerHeight = window.innerHeight;
    this.previousInnerWidth = window.innerWidth;

    // See the comment in styles.scss
    // Also → https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    console.log(`height: ${vh * 100}`);
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
}

export default App;
