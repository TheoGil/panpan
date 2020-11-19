const STROKE_WEIGHT = parseInt(
  window
    .getComputedStyle(document.body)
    .getPropertyValue("--frame-stroke-weight")
);

class Frame {
  constructor() {
    this.top = document.querySelector(".js-frame-top");
    this.topRect = this.top.querySelector("rect");

    this.bottom = document.querySelector(".js-frame-bottom");
    this.bottomRect = this.bottom.querySelector("rect");

    this.left = document.querySelector(".js-frame-left");
    this.leftRect = this.left.querySelector("rect");

    this.right = document.querySelector(".js-frame-right");
    this.rightRect = this.right.querySelector("rect");

    this.setDimensions();
  }

  setDimensions() {
    this.top.setAttribute(
      "viewBox",
      `0 0 ${window.innerWidth} ${STROKE_WEIGHT}`
    );
    this.topRect.setAttribute("width", window.innerWidth);
    this.topRect.setAttribute("height", STROKE_WEIGHT);

    this.left.setAttribute(
      "viewBox",
      `0 0 ${STROKE_WEIGHT} ${window.innerHeight}`
    );
    this.leftRect.setAttribute("width", STROKE_WEIGHT);
    this.leftRect.setAttribute("height", window.innerHeight);

    this.right.setAttribute(
      "viewBox",
      `0 0 ${STROKE_WEIGHT} ${window.innerHeight}`
    );
    this.rightRect.setAttribute("width", STROKE_WEIGHT);
    this.rightRect.setAttribute("height", window.innerHeight);

    this.bottom.setAttribute(
      "viewBox",
      `0 0 ${window.innerWidth} ${STROKE_WEIGHT}`
    );
    this.bottomRect.setAttribute("width", window.innerWidth);
    this.bottomRect.setAttribute("height", STROKE_WEIGHT);
  }
}

export default Frame;
