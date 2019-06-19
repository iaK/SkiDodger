<template>
    <div class="relative h-full">
        <div v-if="preGame" class="absolute w-full h-full px-8">
            <div class="relative h-full">
                <div class="absolute text-black flex justify-center w-full mt-10 text-center" style="top: 0">
                    <h1 class="text-2xl sm:text-5xl">Welcome to SkiDodger</h1>
                </div>
                <div class="flex items-center justify-center h-full">
                    <div class="flex items-center flex-col text-center">
                        <p class="text-black text:md sm:text-xl mb-8">Dodge the skiers and stay on the board!</p>
                        <div v-if="tilt">
                            <p class="text-black text:md sm:text-xl mb-8">Tilt your device control your rider</p>
                        </div>
                        <div v-else>
                            <p class="text-black text:md sm:text-xl mb-8">Use arrow keys to control your rider</p>
                            <img src="/arrows2.png" class="block" alt="">
                        </div>
                    </div>
                </div>
                <div class="absolute w-full pb-12 text-center" style="bottom: 0">
                    <p class="text-black text-xl sm:text-4xl mb-4" @click="start" v-text="tilt ? 'Click here to start' : 'Press Enter to start'"></p>
                </div>
            </div>

        </div>
        <div v-if="endGame" class="absolute w-full h-full flex items-center justify-center px-4" style="background-color: rgba(0,0,0,.7)">
            <div class="text-center">
                <p class="text-white mb-4 sm:mb-2 text-3xl sm:text-5xl">Game over</p>
                <p class="text-white mb-6 text-lg sm:text-xl">
                    <span v-if="score == bestScore">Highscore!!</span>
                    <span v-else>Score:</span>
                    {{ score }}
                </p>
                <p @click="reset" class="text-xl sm:text-2xl mt-2 text-white">Retry?</p>
            </div>
        </div>
        <div v-if="bestScore && !endGame" class="absolute text-black text-sm sm:text-xl" style="top: 10px; left: 15px;">
            Highscore:{{ bestScore }}
        </div>
        <div v-if="!endGame && !preGame" class="absolute text-black text-xl sm:text-3xl" style="top: 10px; right: 15px">
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
    import background from './Background.js';
    import utilities from './Utilities.js';
    import Vue from 'vue';

    Vue.mixin(skiers);
    Vue.mixin(cloud);
    Vue.mixin(boarder);
    Vue.mixin(keyboardEvents);
    Vue.mixin(background);
    Vue.mixin(utilities);

    export default {
        data() {
            return {
                score: 0,
                bestScore: 0,
                preGame: true,
                pause: false,
                endGame: false,
                velocity: 1000,
                distance: 0,
                oneIn: 10,
                stageInterval: null,
                scoreInterval: null,
                velocityInterval: null,
                addSkierInterval: null,
                canvas: null,
                c: null,
                img: null,
            }
        },

        mounted() {
            this.canvas = this.$refs.canvas;
            this.c = this.canvas.getContext('2d');
            this.img = this.$refs.img;

            this.boarder = this.$refs.boarder;

            this.optimizeForRetina();
            this.setBoarderStarterPos();

            requestAnimationFrame(this.preGameDraw);
        },

        methods: {
            preGameDraw(time) {
                if (this.preGame) {
                    this.distance -= this.calcOffset(time);
                    this.drawBackground();

                    requestAnimationFrame(this.preGameDraw);
                }
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

                requestAnimationFrame(this.draw);
            },

            reset() {
                this.skiers = [];
                this.clouds = [];
                this.oneIn = 10;
                this.score = 0;
                this.velocity = 1000;
                this.boarderPosX = this.canvas.width / 2 - (this.boarder.width / 2)
                this.boarderPosY = 40;
                this.pause = false;
                this.endGame = false;
                this.firstOriantationEvent = true;
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
                clearInterval(this.addSkierInterval);
            },

            start(){
                this.preGame = false;
                this.addSkierInterval = setInterval(this.maybeAddSkier, 100)
                this.stageInterval = setInterval(this.increaseNewSkierRate, 20000)
                this.scoreInterval = setInterval(this.increaseScore, 100)
                this.velocityInterval = setInterval(this.increaseVelocity, 2000)

                this.lastFrameRepaintTime = window.performance.now();
                requestAnimationFrame(this.draw);
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

            increaseNewSkierRate() {
                if (this.pause) return;

                if (this.oneIn > 1) {
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
        }
    }

</script>
