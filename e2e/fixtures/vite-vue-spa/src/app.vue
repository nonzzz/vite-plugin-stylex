<template>
  <div>
    <h1 id="text" v-bind="cls">vite-plugin-stylex-dev</h1>
    <button type="button" @click="handleClick">Change color</button>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import stylex from '@stylexjs/stylex'

const styles = stylex.create({
  red: {
    color: 'red'
  },
  blue: {
    color: 'blue'
  }
})

export default defineComponent({
  setup() {
    const color = ref('red')
    const handleClick = () => color.value = color.value === 'red' ? 'blue' : 'red'

    const cls = computed(() => stylex.attrs(color.value === 'red' ? styles.red : styles.blue))

    return {
      cls,
      handleClick
    }
  }
})
</script>
