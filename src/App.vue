<template>
  <div id="app" style="height:100%">
    <background-scroller></background-scroller>
  </div>
</template>

<script>
import BackgroundScroller from './components/BackgroundScroller.vue'

export default {
  name: 'app',
  components: {
    BackgroundScroller
  }
}
</script>

<style lang="scss">
  @import "./scss/styles.scss";
</style>
