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
    const uuid = require('uuid/v1');

    export default {

        data() {
            return {
                bestScore: 0,
                preGame: true,
                canvas: null,
                c: null,
                img: null,
                boarder: null,
                cloud1: null,
                cloud2: null,
                cloud3: null,
                cloud4: null,
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
                clouds: [],
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
            this.c.scale(2,2)
            this.img = this.$refs.img;
            this.boarder = this.$refs.boarder;
            this.skier = this.$refs.skier;
            this.cloud1 = this.$refs.cloud1;
            this.cloud2 = this.$refs.cloud2;
            this.cloud3 = this.$refs.cloud3;
            this.cloud4 = this.$refs.cloud4;

            let dpi = window.devicePixelRatio;

            let style_height =+ getComputedStyle(this.canvas).getPropertyValue("height").slice(0, -2);
            let style_width =+ getComputedStyle(this.canvas).getPropertyValue("width").slice(0, -2);

            this.canvas.setAttribute('height', style_height * dpi);
            this.canvas.setAttribute('width', style_width * dpi);

            window.addEventListener('keyup', this.upEvents);
            window.addEventListener('keydown', this.downEvents);

            this.boarderPosX = this.canvas.width / 2 - (this.boarder.width / 2)
            this.boarderPosY = 40;
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
            downEvents(event) {
                if (event.keyCode == 38) {
                    this.upPress = true
                    this.boarder = this.$refs.boarderBack;
                    this.yDir = -12
                }
                if (event.keyCode == 40) {
                    this.downPress = true
                    this.yDir = 12
                }
                if (event.keyCode == 37) {
                    this.leftPress = true
                    if (!this.upPress) {
                        this.boarder = this.$refs.boarderLeft;
                    }
                    this.xDir = -12
                }
                if (event.keyCode == 39) {
                    this.rightPress = true
                    if (!this.upPress) {
                        this.boarder = this.$refs.boarderRight;
                    }
                    this.xDir = 12
                }
            },
            upEvents(event) {
                if (event.keyCode == 13) {
                    if (this.preGame) {
                        this.start();
                    } else if (this.endGame) {
                        this.reset();
                    }
                }
                if (event.keyCode == 32) {
                    if (! this.endGame && ! this.preGame) {
                        this.pause ? this.resume() : this.stop();
                    }
                }
                if (event.keyCode == 38) {
                    this.upPress = false;
                    if (this.downPress) {
                        this.yDir = 12;
                    } else {
                        this.yDir = 0
                    }
                }
                if (event.keyCode == 40) {
                    this.downPress = false;
                    if (this.upPress) {
                        this.boarder = this.$refs.boarderBack
                        this.yDir = -12;
                    } else {
                        this.yDir = 0
                    }
                }
                if (event.keyCode == 37) {
                    this.leftPress = false;
                    if (this.rightPress) {
                        this.boarder = this.$refs.boarderRight
                        this.xDir = 12;
                    } else {
                        this.xDir = 0
                    }
                }
                if (event.keyCode == 39) {
                    this.rightPress = false;
                    if (this.leftPress) {
                        this.boarder = this.$refs.boarderLeft
                        this.xDir = -12;
                    } else {
                        this.xDir = 0
                    }
                }

                if (!this.leftPress && !this.rightPress && !this.upPress) this.boarder = this.$refs.boarder;
            },
            calcOffset(time){
                var frameGapTime = time - this.lastFrameRepaintTime;
                this.lastFrameRepaintTime = time;
                var translateX = this.velocity*(frameGapTime/1000);
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
                if (this.distance < -this.canvas.height) this.distance = 0;

                this.c.clearRect(0,0,this.canvas.width,this.canvas.height);
                this.c.save();
                this.c.translate(0,this.distance);

                // Main img
                this.c.drawImage(this.img,0,0,this.img.width, this.img.height, 0, 0, this.canvas.width, this.canvas.height);
                // Filler img
                this.c.drawImage(this.img,0,0, this.img.width, this.img.height, 0,this.canvas.height-1, this.canvas.width, this.canvas.height);
                this.c.restore();

                this.drawBoarder();
                if (this.randomInt(this.oneIn) >= this.oneIn - 1) {
                    this.drawSkier();
                }
                this.drawSkiers();
                this.drawClouds();

                requestAnimationFrame(this.draw);

            },

            drawBoarder() {
                this.boarderPosX += this.xDir;
                if (this.boarderPosX < 0) this.boarderPosX = 0;
                if (this.boarderPosX >= this.canvas.width - this.boarderWidth) this.boarderPosX = this.canvas.width - this.boarderWidth;

                this.boarderPosY += this.yDir;
                if (this.boarderPosY < 0) this.boarderPosY = 0;
                if (this.boarderPosY > this.canvas.height - this.boarderHeight) this.boarderPosY = this.canvas.height - this.boarderHeight;

                this.c.drawImage(this.boarder,0,0,this.boarder.width, this.boarder.height, this.boarderPosX, this.boarderPosY, this.boarderWidth, this.boarderHeight);
                let collision = this.checkCollision(this.boarderPosX, this.boarderPosY, this.boarderWidth, this.boarderHeight)

                if (collision.length) {
                    this.loose();
                }
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

            checkCollision(toCheckX, toCheckY, width, height) {
                return this.skiers.filter((skier) => {

                    if (
                        this.col(toCheckX, toCheckY, skier)
                        || this.col(toCheckX, toCheckY + height, skier)
                        || this.col(toCheckX + width, toCheckY, skier)
                        || this.col(toCheckX + width, toCheckY + height, skier)
                    ) {
                        return true
                    }
                })
            },

            col(toCheckX, toCheckY, skier) {
                if (toCheckX > skier.x && toCheckX < skier.x + this.skierWidth) {
                    if (toCheckY  > skier.y && toCheckY < skier.y + this.skierHeight) {
                        return true;
                    }
                }

                return false
            },

            drawSkier() {
                let skier = {
                    id: uuid(),
                    x: this.randomInt(this.canvas.width),
                    y:  this.canvas.height + this.randomInt(200),
                    nextTurn: 20 + this.randomInt(20), turn: "left",
                    xSpeed: 4 + this.randomInt(6),
                    ySpeed: 4 + this.randomInt(14),
                    crash: false,
                }
                this.skiers.push(skier);
            },

            drawLameSkiers() {
                this.skiers.forEach((skier) => {
                    this.c.drawImage(this.skier,0,0,this.skier.width, this.skier.height, skier.x, skier.y -this.distance, this.skierWidth, this.skierHeight);
                })
            },

            drawSkiers() {
                let collisions = [];
                this.skiers = this.skiers.map((skier) => {
                    let skierY = skier.crash ? skier.y - 25: skier.y;

                    if (! skier.crash) {
                        this.c.drawImage(this.skier,0,0,this.skier.width, this.skier.height, skier.x, skierY, this.skierWidth, this.skierHeight);
                        if (skier.nextTurn == 0) {
                            skier.turn = skier.turn == "left" ? "right" : "left";
                            skier.nextTurn = 20 + this.randomInt(20)
                        }

                        if (skier.turn == "left") {
                            skier.x -= skier.xSpeed
                        } else {
                            skier.x += skier.xSpeed
                        }
                        skier.nextTurn--
                        skier.y -= skier.ySpeed;
                    } else {
                        skier.y = skierY;
                    }

                    if (! skier.crash) {
                        let col = this.checkCollision(skier.x, skier.y, this.skierWidth, this.skierHeight);
                        if (col.length) {
                            if (this.randomInt(5) >= 4) {
                                collisions.push(skier)
                            } else {
                                skier.nextTurn += 10;
                                col[0].nextTurn += 10;
                                skier.turn = skier.turn == 'left' ? 'right' : 'left';
                                col[0].turn = col[0].turn == 'left' ? 'right' : 'left';
                            }
                        }
                    }

                    return skier;
                }).filter((skier) => skier.y > -100)

                this.crashSkiers(collisions);
            },
            crashSkiers(skiers) {
                skiers = skiers.map(skier => skier.id);
                this.skiers = this.skiers.map(skier => {
                    if (skiers.includes(skier.id)) {
                        this.addCloud(skier.x + this.skierWidth / 2, skier.y + this.skierHeight / 2);
                        skier.crash = true;
                    }

                    return skier;
                });
            },

            addCloud(x, y) {
                this.clouds.push({x: x - 40,y:  y - 40, state: 1, count: 0})
            },

            drawClouds() {
                this.clouds = this.clouds.map(cloud => {
                    this.c.drawImage(this['cloud' + cloud.state],0,0,this['cloud' + cloud.state].width, this['cloud' + cloud.state].height, cloud.x, cloud.y, 160, 160);
                    cloud.y -= 25
                    if (cloud.y < 0) {
                        return false
                    }
                    cloud.count++
                    if(cloud.count >= 10) {
                        cloud.state = cloud.state >= 4 ? 1 : cloud.state +1;
                        cloud.count = 0;
                    }
                    return cloud
                }).filter((cloud) => cloud)
            },

            start(){
                this.preGame = false;
                this.stageInterval = setInterval(() => {
                    if (this.pause) return;

                    if (this.oneIn > 3) {
                        this.oneIn--
                    }
                }, 20000)
                this.scoreInterval = setInterval(() => {
                    if (this.pause) return;
                    this.score++
                }, 100)
                this.velocityInterval = setInterval(() => {
                    this.velocity += 10
                }, 2000)

                this.lastFrameRepaintTime = window.performance.now();
                requestAnimationFrame(this.draw);
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
