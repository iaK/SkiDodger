export default {
    data() {
        return {
            leftPress: false,
            rightPress: false,
            upPress: false,
            downPress: false,
            firstOriantationEvent: true,
            baseAlpha: 0,
            baseBeta: 0,
            baseGamma: 0,
            tilt: false,
        }
    },

    mounted() {
        this.createEventListeners();
    },

    computed: {
        portrait() {
            return window.innerHeight > window.innerWidth
        }
    },

    methods: {
        createEventListeners() {
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', this.deviceOrientationHandler, false);
            }
            window.addEventListener('keyup', this.upEvents);
            window.addEventListener('keydown', this.downEvents);
        },

        deviceOrientationHandler(event) {
            if (this.firstOriantationEvent) {
                this.tilt = true;
                this.baseGamma = event.gamma;
                this.baseBeta = event.beta;
                this.baseAlpha = event.alpha;
                this.firstOriantationEvent = false;
            }
            this.portrait ? this.portraitDeviceOrientationHandler(event) : this.landscapeDeviceOrientationHandler(event);
        },

        landscapeDeviceOrientationHandler(event) {
            if (event.gamma > this.baseGamma + 20) {
                this.leftPress = false;
                this.pressRight();
            } else if (event.gamma < this.baseGamma - 20) {
                this.rightPress = false;
                this.pressLeft();
            } else {
                this.leftPress = this.rightPress = false
                this.xDir = 0
            }

            if (event.beta > this.baseBeta + 20) {
                this.upPress = false
                this.pressDown();
            } else if (event.beta < this.baseBeta -20) {
                this.downPress = false
                this.pressUp();
            } else {
                this.downPress = this.upPress = false;
                this.yDir = 0;
            }

            if (! this.leftPress && ! this.rightPress && ! this.upPress) this.boarder = this.$refs.boarder;
        },

        portraitDeviceOrientationHandler(event) {
            if (event.alpha > this.calculateAlphaValue(this.baseAlpha + 20)) {
                this.leftPress = false;
                this.pressRight();
            } else if (event.alpha < this.calculateAlphaValue(this.baseAlpha - 20)) {
                this.rightPress = false;
                this.pressLeft();
            } else {
                this.leftPress = this.rightPress = false
                this.xDir = 0
            }

            if (event.gamma > this.baseGamma + 20) {
                this.upPress = false
                this.pressDown();
            } else if (event.gamma < this.baseGamma -20) {
                this.downPress = false
                this.pressUp();
            } else {
                this.downPress = this.upPress = false;
                this.yDir = 0;
            }

            if (! this.leftPress && ! this.rightPress && ! this.upPress) this.boarder = this.$refs.boarder;
        },

        calculateAlphaValue(alpha) {
            if (alpha > 360) {
                return alpha - 360;
            }
            if (alpha < 360) {
                return 360 - alpha;
            }

            return alpha;
        },

        downEvents(event) {
            // KEY UP
            if (event.keyCode == 38) this.pressUp();
            // KEY DOWN
            if (event.keyCode == 40) this.pressDown();
            // KEY LEFT
            if (event.keyCode == 37) this.pressLeft();
            // KEY RIGHT
            if (event.keyCode == 39) this.pressRight()
        },
        upEvents(event) {
            // ENTER
            if (event.keyCode == 13) {
                if (this.preGame) {
                    this.start();
                } else if (this.endGame) {
                    this.reset();
                }
            }

            // SPACE
            if (event.keyCode == 32) {
                if (! this.endGame && ! this.preGame) {
                    this.pause ? this.resume() : this.stop();
                }
            }

            // KEY UP
            if (event.keyCode == 38) {
                this.upPress = false;
                if (this.downPress) {
                    this.pressDown();
                } else {
                    this.yDir = 0
                }
            }

            // KEY DOWN
            if (event.keyCode == 40) {
                this.downPress = false;
                if (this.upPress) {
                    this.pressUp();
                } else {
                    this.yDir = 0
                }
            }

            // KEY LEFT
            if (event.keyCode == 37) {
                this.leftPress = false;
                if (this.rightPress) {
                    this.pressRight()
                } else {
                    this.xDir = 0
                }
            }

            // KEY RIGHT
            if (event.keyCode == 39) {
                this.rightPress = false;
                if (this.leftPress) {
                    this.pressLeft();
                } else {
                    this.xDir = 0
                }
            }

            if (! this.leftPress && ! this.rightPress && ! this.upPress) this.boarder = this.$refs.boarder;
        },

        pressLeft() {
            this.leftPress = true
            if (! this.upPress) this.boarder = this.$refs.boarderLeft;
            this.xDir = -12
        },

        pressRight() {
            this.rightPress = true
            if (! this.upPress) this.boarder = this.$refs.boarderRight;
            this.xDir = 12
        },

        pressUp() {
            this.upPress = true
            this.boarder = this.$refs.boarderBack;
            this.yDir = -12
        },

        pressDown() {
            this.downPress = true
            this.yDir = 12
        },
    }
}
