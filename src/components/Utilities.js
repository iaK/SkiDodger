export default {
    methods: {
        randomInt(max) {
          return Math.floor(Math.random() * Math.floor(max));
        },

        randomIntBetween(min, max) {
            return this.randomInt(max - min) + min
        },

        optimizeForRetina() {
            let dpi = window.devicePixelRatio;

            let style_height =+ getComputedStyle(this.canvas).getPropertyValue("height").slice(0, -2);
            let style_width =+ getComputedStyle(this.canvas).getPropertyValue("width").slice(0, -2);

            this.c.scale(2,2)
            this.canvas.setAttribute('height', style_height * dpi);
            this.canvas.setAttribute('width', style_width * dpi);
        },
    }
}
