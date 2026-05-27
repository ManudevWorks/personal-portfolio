export default class ClockComponent extends HTMLElement {
    constructor() {
        super();
        this.intervalId = null;
    }
    connectedCallback() {
        this.render();
        this.start();
    }
    disconnectedCallback() {
        this.stop();
    }
    start() {
        this.intervalId = window.setInterval(() => {
            this.render();
        }, 1000);
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    formatTime(date) {
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        const s = String(date.getSeconds()).padStart(2, "0");
        return `${h}:${m}:${s}`;
    }
    render() {
        const now = new Date();
        this.textContent = this.formatTime(now);
    }
}
