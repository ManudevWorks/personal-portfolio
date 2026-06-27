import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

class WorksHorizontal extends HTMLElement {
    connectedCallback() {
        const pinEl = this.querySelector(".works-pin");
        const track  = this.querySelector(".works-track");
        if (!pinEl || !track) return;

        this._mm = gsap.matchMedia();

        this._mm.add(
            "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
            () => {
                const panels = gsap.utils.toArray(".works-panel", this);

                // Pin .works-pin (not `this`) so GSAP's DOM swap never touches
                // the custom element and never triggers disconnectedCallback.
                const scrollTween = gsap.to(track, {
                    x: () => -(track.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: pinEl,
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                        end: () => "+=" + (track.scrollWidth - window.innerWidth),
                    },
                });

                panels.forEach((panel) => {
                    const revealEls = panel.querySelectorAll(".works-panel__reveal");
                    if (revealEls.length === 0) return;

                    gsap.from(revealEls, {
                        y: 40,
                        opacity: 0,
                        stagger: 0.12,
                        duration: 0.7,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: scrollTween,
                            start: "left 85%",
                            toggleActions: "play none none none",
                        },
                    });
                });

                return () => {
                    scrollTween.scrollTrigger?.kill();
                };
            }
        );
    }

    disconnectedCallback() {
        this._mm?.revert();
        this._mm = null;
    }
}

if (!customElements.get("works-horizontal")) {
    customElements.define("works-horizontal", WorksHorizontal);
}
