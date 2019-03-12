<template>
    <div>
        <canvas ref="canvas" id="canvas" style="width:100%; height:100%"></canvas>
    </div>
</template>

<script>

    export default {

        data() {
            return {
                ctx: null,
                tempCanvas: null,
                tempContext: null,
                scrollImg: null,
                imgWidth: 0,
                imgHeight: 0,
                imageData: {},
                canvasWidth: 920,
                canvasHeight: 613,
                scrollVal: 0,
                speed: 2,
            }
        },

        mounted() {
            this.ctx = document.getElementById("canvas").getContext("2d"),
            this.canvasTemp = document.createElement("canvas"),
            this.scrollImg = new Image(),
            this.tempContext = this.canvasTemp.getContext("2d"),
            this.scrollImg.src = "snow.jpg";
            this.scrollImg.onload = this.loadImage;
        },

        methods: {
            loadImage(){
                this.imgWidth = this.scrollImg.width,
                this.imgHeight = this.scrollImg.height;
                this.canvasTemp.width = this.imgWidth;
                this.canvasTemp.height = this.imgHeight;
                this.rerender();
                console.log(this.$refs.canvas);
            },

            rerender(){
                this.ctx.clearRect(0,0,this.$refs.canvas.offsetWidth,this.$refs.canvas.offsetHeight);

                if(this.scrollVal >= this.$refs.canvas.offsetHeight){
                    this.scrollVal = 0;
                }


                this.scrollVal += this.speed;
                this.ctx.drawImage(this.scrollImg, 0, -this.scrollVal, this.imgWidth, this.imgHeight);
                this.ctx.drawImage(this.scrollImg, 0, this.$refs.canvas.offsetHeight - this.scrollVal, this.imgWidth, this.imgHeight);


                setTimeout(() => this.rerender(),10);
                 // // To go the other way instead
                 // ctx.drawImage(this.scrollImg, -this.scrollVal, 0, this.imgWidth, this.imgHeight);
                 // ctx.drawImage(this.scrollImg, this.canvasWidth - this.scrollVal, 0, this.imgWidth, this.imgHeight);
            }
        }
    }

</script>
