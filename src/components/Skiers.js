const LEFT_TURN_DIRECTION = Symbol('left-turn-direction');
const RIGHT_TURN_DIRECTION = Symbol('right-turn-direction');
const uuid = require('uuid/v1');

export default {
    data() {
        return {
            collisions: [],
        }
    },

    methods: {
        addSkier() {
            this.skiers.push({
                id: uuid(),
                x: this.randomInt(this.canvas.width),
                y: this.randomIntBetween(this.canvas.height, this.canvas.height + 200),
                nextTurn: this.randomIntBetween(20, 40),
                turn: LEFT_TURN_DIRECTION,
                xSpeed: this.randomIntBetween(4, 6),
                ySpeed: this.randomIntBetween(4, 10),
                crash: false,
            });
        },

        shouldDrawSkier() {
            return this.randomInt(this.oneIn) >= this.oneIn - 1
        },

        drawLameSkiers() {
            this.skiers.forEach((skier) => {
                this.c.drawImage(this.skier,0,0,this.skier.width, this.skier.height, skier.x, skier.y -this.distance, this.skierWidth, this.skierHeight);
            })
        },

        drawSkiers() {
            this.skiers = this.skiers.map((skier) => {
                if (skier.crash) {
                    skier.y = skier.y - 25;
                    return skier;
                }

                this.c.drawImage(this.skier,0,0,this.skier.width, this.skier.height, skier.x, skier.y, this.skierWidth, this.skierHeight);

                skier = this.changeTurnState(skier);
                skier = this.moveSkier(skier);
                skier = this.checkSkierCollision(skier);

                return skier;
            }).filter((skier) => skier.y > -100)
        },

        checkSkierCollision(skier) {
            let skierCollision = this.checkCollisions(skier.x, skier.y, this.skierWidth, this.skierHeight);

            if (skierCollision.length) {
                if (this.randomInt(8) >= 7) {
                    this.collisions.push(skier)
                }

                skier.nextTurn += 10;
                skier.turn = this.switchTurnDirection(skier.turn);
            }

            return skier;
        },

        moveSkier(skier) {
            if (skier.turn === LEFT_TURN_DIRECTION) {
                skier.x -= skier.xSpeed
            } else {
                skier.x += skier.xSpeed
            }

            skier.y -= skier.ySpeed;

            return skier;
        },

        changeTurnState(skier) {
            if (skier.nextTurn == 0) {
                skier.turn = this.switchTurnDirection(skier.turn);
                skier.nextTurn = this.randomIntBetween(20, 40);
            }

            skier.nextTurn--;

            return skier;
        },

        switchTurnDirection(direction) {
            return direction === LEFT_TURN_DIRECTION ? RIGHT_TURN_DIRECTION : LEFT_TURN_DIRECTION;
        },

        crashSkiers() {
            let skiers = this.collisions.map(skier => skier.id);

            this.skiers = this.skiers.map(skier => {
                if (skiers.includes(skier.id)) {
                    this.addCloud(skier.x + this.skierWidth / 2, skier.y + this.skierHeight / 2);
                    skier.crash = true;
                }

                return skier;
            });

            this.collisions = [];
        },
    }
}
