export default {
    data() {
        return {
            boarder: null,
            boarderPosX: 0,
            boarderPosY: 0,
            xDir: 0,
            yDir: 0,
        }
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
    },

    methods: {
        setBoarderStarterPos() {
            this.boarderPosX = this.canvas.width / 2 - (this.boarder.width / 2)
            this.boarderPosY = 40;
        },

        drawBoarder() {
            // Prevent boarder going out of screen X
            this.boarderPosX += this.xDir;
            if (this.boarderPosX < 0) this.boarderPosX = 0;
            if (this.boarderPosX >= this.canvas.width - this.boarderWidth) this.boarderPosX = this.canvas.width - this.boarderWidth;

            // Prevent boarder going out of screen Y
            this.boarderPosY += this.yDir;
            if (this.boarderPosY < 0) this.boarderPosY = 0;
            if (this.boarderPosY > this.canvas.height - this.boarderHeight) this.boarderPosY = this.canvas.height - this.boarderHeight;

            this.c.drawImage(this.boarder,0,0,this.boarder.width, this.boarder.height, this.boarderPosX, this.boarderPosY, this.boarderWidth, this.boarderHeight);

            let collision = this.checkCollisions(this.boarderPosX, this.boarderPosY, this.boarderWidth, this.boarderHeight)

            if (collision.length) {
                this.loose();
            }
        },
    }
}
