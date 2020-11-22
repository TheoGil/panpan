import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

class Screen {
  constructor(options) {
    this.id = options.id;
    this.backdrop = options.backdrop;
    this.elements = options.el.querySelectorAll(".js-stagger");

    this.st = ScrollTrigger.create({
      trigger: options.el.querySelector(".wrapper"),
      onEnter: () => {
        this.animateIn();
      },
      onEnterBack: () => {
        this.animateInBackdrop();
      },
      onLeave: () => {
        this.animateOutBackdrop();
      },
      onLeaveBack: () => {
        this.animateOutBackdrop();
      },
    });
  }

  animateIn() {
    gsap.to(this.elements, {
      opacity: 1,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      "--progress": 1,
      stagger: 0.1,
      ease: "power2.out",
    });
    this.animateInBackdrop();
  }

  animateInBackdrop() {
    gsap.killTweensOf(this.backdrop.mesh.scale);
    gsap.to(this.backdrop.mesh.scale, {
      x: this.backdrop.scaleX,
      y: this.backdrop.scaleY,
      duration: 1,
      ease: "power2.out",
    });
  }

  animateOutBackdrop() {
    gsap.killTweensOf(this.backdrop.mesh.scale);
    gsap.to(this.backdrop.mesh.scale, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.out",
    });
  }
}

class Screens {
  constructor(options) {
    gsap.registerPlugin(ScrollTrigger);
    this.screens = [];

    document.querySelectorAll(".screen").forEach((el, i) => {
      this.screens.push(
        new Screen({
          id: i,
          el,
          backdrop: options.backdrops[i],
          scrollTriger: true,
        })
      );
    });
  }
}

export default Screens;
