<template>
  <div :class="cl">
    123
  </div>
</template>

<script setup>
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './stylex'

const cl = computed(() => stylex.props(styles.normal).className)
</script>

<style scoped>
div {
  font-size: 20px;
}
</style>
