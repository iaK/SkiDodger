<template>
  <div id="app" style="height:100%">
    <game-wrapper></game-wrapper>
  </div>
</template>

<script>
import gameWrapper from './components/GameWrapper.vue'

export default {
  name: 'app',
  components: {
    gameWrapper
  }
}
</script>

<style lang="scss">
</style>
