<template>
    <div class="relative h-full">
        <div v-if="preGame" class="absolute w-full h-full">
            <div class="flex items-center justify-center h-full">
                <div class="flex items-center flex-col">
                    <p class="text-black text-xl mb-4">Dodge the skiers and get as far down the slope as you can</p>
                    <p class="text-black text-xl mb-8">Use arrow keys to control your rider</p>
                    <img src="/arrows2.png" class="block" alt="">
                </div>
            </div>
            <div class="absolute text-black flex justify-center w-full mt-10" style="top: 0">
                <h1 style="font-size: 3rem">Welcome to SkiDodger</h1>
            </div>
            <div class="absolute w-full pb-12 text-center" style="bottom: 0">
                <p class="text-black text-4xl mb-4">Press Enter to start</p>
            </div>

        </div>
        <div v-if="endGame" class="absolute w-full h-full flex items-center justify-center" style="background-color: rgba(0,0,0,.7)">
            <div class="text-center">
                <p class="text-white mb-2" style="font-size: 4rem">Game over</p>
                <p class="text-white mb-6" style="font-size: 2rem">
                    <span v-if="score == bestScore">Highscore!!</span>
                    <span v-else>Score:</span>
                    {{ score }}
                </p>
                <p @click="reset" class="text-xl mt-2 text-white" style="font-size: 2rem">Retry?</p>
            </div>
        </div>
        <div v-if="bestScore && !endGame" class="absolute text-black" style="top: 10px; left: 15px; font-size: 1rem">
            Highscore:{{ bestScore }}
        </div>
        <div v-if="!endGame && !preGame" class="absolute text-black" style="top: 10px; right: 15px; font-size: 4rem">
            {{ score }}
        </div>
        <canvas ref="canvas" id="canvas" style="width:100%; height:100%"></canvas>
        <img ref="img" src="/snow3.jpg" alt="" style="display: none">
        <img ref="boarder" src="/boarder.png" alt="" style="display: none">
        <img ref="boarderLeft" src="/boarderleft.png" alt="" style="display: none">
        <img ref="boarderRight" src="/boarderright.png" alt="" style="display: none">
        <img ref="boarderBack" src="/boarderback.png" alt="" style="display: none">
        <img ref="skier" src="/skier.png" alt="" style="display: none">
        <img ref="cloud1" src="/cloud1.png" alt="" style="display: none">
        <img ref="cloud2" src="/cloud2.png" alt="" style="display: none">
        <img ref="cloud3" src="/cloud3.png" alt="" style="display: none">
        <img ref="cloud4" src="/cloud4.png" alt="" style="display: none">
    </div>
</template>

<script>
    import skiers from './Skiers.js';
    import cloud from './Cloud.js';
    import boarder from './Boarder.js';
    import keyboardEvents from './KeyboardEvents.js';
    import Vue from 'vue';

    Vue.mixin(skiers);
    Vue.mixin(cloud);
    Vue.mixin(boarder);
    Vue.mixin(keyboardEvents);

    export default {
        data() {
            return {
                bestScore: 0,
                preGame: true,
                canvas: null,
                c: null,
                img: null,
                boarder: null,
                skiers: [],
                skier: null,
                velocity: 1000,
                distance: 0,
                lastFrameRepaintTime: 0,
                leftPress: false,
                rightPress: false,
                upPress: false,
                downPress: false,
                boarderPosX: 0,
                boarderPosY: 0,
                xDir: 0,
                yDir: 0,
                oneIn: 25,
                score: 0,
                stageInterval: null,
                scoreInterval: null,
                velocityInterval: null,
                pause: false,
                endGame: false,
            }
        },

        mounted() {
            this.canvas = this.$refs.canvas;
            this.c = this.canvas.getContext('2d');
            this.img = this.$refs.img;
            this.boarder = this.$refs.boarder;
            this.skier = this.$refs.skier;

            this.optimizeForRetina();
            this.createEventListeners();
            this.setBoarderStarterPos();
        },

        computed: {
            boarderWidth() {
                if (this.leftPress || this.rightPress) {
                    return 60;
                }

                if (this.upPress) {
                    return 70;
                }

                return 30;
            },

            boarderHeight() {
                return 80;
            },

            skierWidth() {
                return 80;
            },

            skierHeight() {
                return 100;
            }
        },

        methods: {
            optimizeForRetina() {
                let dpi = window.devicePixelRatio;

                let style_height =+ getComputedStyle(this.canvas).getPropertyValue("height").slice(0, -2);
                let style_width =+ getComputedStyle(this.canvas).getPropertyValue("width").slice(0, -2);

                this.c.scale(2,2)
                this.canvas.setAttribute('height', style_height * dpi);
                this.canvas.setAttribute('width', style_width * dpi);
            },

            calcOffset(time){
                let frameGapTime = time - this.lastFrameRepaintTime;
                let translateX = this.velocity*(frameGapTime/1000);

                this.lastFrameRepaintTime = time;

                return translateX;
            },

            reset() {
                this.skiers = [];
                this.clouds = [];
                this.oneIn = 25;
                this.score = 0;
                this.velocity = 1000;
                this.boarderPosX = this.canvas.width / 2 - (this.boarder.width / 2)
                this.boarderPosY = 40;
                this.pause = false;
                this.endGame = false;
                this.start();
            },

            resume() {
                this.pause = false,
                this.start();
            },

            stop() {
                this.pause = true;
                clearInterval(this.stageInterval);
                clearInterval(this.scoreInterval);
                clearInterval(this.velocityInterval);
            },

            draw(time){
                if (this.pause) {
                    return;
                }

                this.distance -= this.calcOffset(time);

                this.drawBackground();
                this.drawBoarder();
                this.drawSkiers();
                this.crashSkiers();
                this.drawClouds();

                if (this.shouldDrawSkier()) {
                    this.addSkier();
                }

                requestAnimationFrame(this.draw);
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

            loose() {
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                }

                this.pause = true;
                this.endGame = true;

                clearInterval(this.stageInterval);
                clearInterval(this.scoreInterval);
                clearInterval(this.velocityInterval);
            },

            checkCollisions(toCheckX, toCheckY, width, height) {
                return this.skiers.filter((skier) => {
                    if (
                        this.checkCollision(toCheckX, toCheckY, skier)
                        || this.checkCollision(toCheckX, toCheckY + height, skier)
                        || this.checkCollision(toCheckX + width, toCheckY, skier)
                        || this.checkCollision(toCheckX + width, toCheckY + height, skier)
                    ) {
                        return true
                    }
                })
            },

            checkCollision(toCheckX, toCheckY, skier) {
                if (toCheckX > skier.x && toCheckX < skier.x + this.skierWidth) {
                    if (toCheckY  > skier.y && toCheckY < skier.y + this.skierHeight) {
                        return true;
                    }
                }

                return false
            },

            start(){
                this.preGame = false;
                this.stageInterval = setInterval(this.increaseNewSkierRate, 20000)
                this.scoreInterval = setInterval(this.increaseScore, 100)
                this.velocityInterval = setInterval(this.increaseVelocity, 2000)

                this.lastFrameRepaintTime = window.performance.now();
                requestAnimationFrame(this.draw);
            },

            increaseNewSkierRate() {
                if (this.pause) return;

                if (this.oneIn > 3) {
                    this.oneIn--
                }
            },

            increaseScore() {
                    if (this.pause) return;
                    this.score++
            },

            increaseVelocity() {
                this.velocity += 10
            },

            randomInt(max) {
              return Math.floor(Math.random() * Math.floor(max));
            },

            randomIntBetween(min, max) {
                return this.randomInt(max + min) + min
            }
        }
    }

</script>
