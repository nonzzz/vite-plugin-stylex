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
  color: (color) => ({ color })
})

export default defineComponent({
  setup() {
    const color = ref('red')
    const handleClick = () => color.value = color.value === 'red' ? 'blue' : 'red'

    const cls = computed(() => stylex.attrs(styles.color(color.value)))

    return {
      cls,
      handleClick
    }
  }
})
</script>
