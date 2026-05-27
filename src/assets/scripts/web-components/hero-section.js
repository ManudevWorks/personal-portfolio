export default class HeroSection extends HTMLElement {
    constructor() {
        super();
        this.WORDS = [
            'CREATIVE',
            'CRIATIVO',
            'KREATIV',
            'CREATIVITÉ',
            'ΔΗΜΙΟΥΡΓΙΚΟΣ',
            'CREARE',
        ];
        this.currentWordIndex = 0;
        this.isVisible = true;
        this.intervalId = null;
        this.timeoutId = null;
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
            this.fadeOut();
            this.timeoutId = window.setTimeout(() => {
                this.nextWord();
                this.fadeIn();
            }, 800);
        }, 4000);
    }
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        if (this.timeoutId)
            clearTimeout(this.timeoutId);
    }
    nextWord() {
        this.currentWordIndex =
            (this.currentWordIndex + 1) % this.WORDS.length;
        this.updateWord();
    }
    fadeOut() {
        this.isVisible = false;
        this.wordEl.style.opacity = '0';
    }
    fadeIn() {
        this.isVisible = true;
        this.wordEl.style.opacity = '1';
    }
    updateWord() {
        this.wordEl.textContent = this.WORDS[this.currentWordIndex];
    }
    render() {
        this.querySelector(".letter").innerHTML = `
      <div class="hero-word" style="
        transition: opacity 0.8s ease;
        opacity: 1;
      ">
        ${this.WORDS[this.currentWordIndex]}
      </div>
    `;
        this.wordEl = this.querySelector('.hero-word');
    }
}
