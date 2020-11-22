import gsap from "gsap";
import Screens from "./Screens";

class Intro {
  constructor(options) {
    this.backdrops = options.backdrops;
    this.frame = options.frame;
    this.flow = options.flow;
  }

  animateIn() {
    this.screens = new Screens({
      backdrops: this.backdrops,
    });
    this.animateInZipBag();
    this.animateInFrame();

    gsap.to(".js-info", {
      opacity: 1,
      y: 0,
      ease: "power2.out",
      delay: 1,
    });
  }

  animateInScreen() {
    this.screens.screens[0].animateIn();
  }

  animateInZipBag() {
    const uniforms = {
      offset: 0.5,
    };

    gsap.to(uniforms, {
      offset: 0,
      duration: 2,
      ease: "power4.out",
      onUpdate: () => {
        this.flow.updatePathOffset(uniforms.offset);
      },
    });
  }

  animateInFrame() {
    const frameUniforms = {
      uBorderWidth: 0,
      uNoiseAmount: 0,
    };
    gsap.to(frameUniforms, {
      uBorderWidth: 0.01,
      uNoiseAmount: 0.0015,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        this.frame.material.uniforms.uBorderWidth.value =
          frameUniforms.uBorderWidth;
        this.frame.material.uniforms.uNoiseAmount.value =
          frameUniforms.uNoiseAmount;
      },
    });
  }
}

export default Intro;
