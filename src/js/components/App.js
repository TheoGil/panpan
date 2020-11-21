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

    this.gl = new GL();

    this.onResize = debounce(DEBOUNCE_AMOUNT, this.onResize.bind(this));

    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    this.gl.onResize();
  }
}

export default App;
