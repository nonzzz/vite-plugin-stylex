<template>
  <div :class="cls">
    <slot />
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  card: {
    border: '1px solid red',
    color: 'red',
    fontSize: '30px'
  }
})

export default defineComponent({
  setup() {
    const cls = computed(() => stylex.props(styles.card).className)
    return { cls }
  }
})
</script>
