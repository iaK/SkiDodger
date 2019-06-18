export default {
    data() {
        return {
            clouds: [],
            cloud1: null,
            cloud2: null,
            cloud3: null,
            cloud4: null,
        }
    },

    mounted() {
        this.cloud1 = this.$refs.cloud1;
        this.cloud2 = this.$refs.cloud2;
        this.cloud3 = this.$refs.cloud3;
        this.cloud4 = this.$refs.cloud4;
    },

    methods: {
        addCloud(x, y) {
            this.clouds.push({x: x - 40,y:  y - 40, state: 1, count: 0})
        },

        drawCloud(cloud) {
            let cloudType = `cloud${cloud.state}`;

            this.c.drawImage(this[cloudType],0,0,this[cloudType].width, this[cloudType].height, cloud.x, cloud.y, 160, 160);

            cloud.y -= 25

            return this.changeCloudState(cloud);
        },

        changeCloudState(cloud) {
            cloud.count++

            if (cloud.count >= 10) {
                cloud.state = cloud.state >= 4 ? 1 : cloud.state +1;
                cloud.count = 0;
            }

            return cloud
        },

        drawClouds() {
            this.clouds = this.clouds.map(cloud => {
                return this.drawCloud(cloud)
            }).filter((cloud) => cloud && cloud.y > 0)
        },
    }
}
