export default {
    data() {
        return {
            lastFrameRepaintTime: 0,
        }
    },

    methods: {
      calcOffset(time){
            let frameGapTime = time - this.lastFrameRepaintTime;
            let translateX = this.velocity*(frameGapTime/1000);

            this.lastFrameRepaintTime = time;

            return translateX;
        },

        drawBackground() {
            if (this.distance < -this.canvas.height) this.distance = 0;

            this.c.clearRect(0,0,this.canvas.width,this.canvas.height);
            this.c.save();
            this.c.translate(0,this.distance);

            // Main img
            this.c.drawImage(this.img,0,0,this.img.width, this.img.height, 0, 0, this.canvas.width, this.canvas.height);
            // Filler img
            this.c.drawImage(this.img,0,0, this.img.width, this.img.height, 0,this.canvas.height-1, this.canvas.width, this.canvas.height);
            this.c.restore();
        },
    }
}
