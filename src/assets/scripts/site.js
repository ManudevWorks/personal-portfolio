import ClockComponent from "@scripts/web-components/clock-component.js";
import HeroSection from "@scripts/web-components/hero-section.js";

(() => {
    if (!customElements.get("clock-component")) {
        customElements.define("clock-component", ClockComponent);
    }

    if (!customElements.get("hero-section")) {
        customElements.define("hero-section", HeroSection);
    }
})();