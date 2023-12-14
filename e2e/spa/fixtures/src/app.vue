<template>
  <div >
  </div>
</template>

<script>
import * as stylex from '@stylexjs/stylex'
import { computed, defineComponent } from 'vue'

const styles = stylex.create({
  layout: {
    color: 'red'
  }
})

export default defineComponent({
  setup() {
    const className = computed(() => {})

    return {}
  }
})
</script>
