<template>
  <div :class="cl">
    <Card>
      123
      456
    </Card>
  </div>
</template>

<script setup>
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './stylex'
import Card from './card.vue'

const cl = computed(() => stylex.props(styles.normal).className)
</script>

<style scoped>
div {
  font-size: 20px;
}
</style>
