<template>
  <div>
    <div :class="className" role="button" @click="handleClick">Action</div>
  </div>
</template>
  
<script>
import * as stylex from '@stylexjs/stylex'
import { computed, defineComponent, ref } from 'vue'
  
const styles = stylex.create({
  text: { fontSize: '20px', cursor: 'pointer' },
  blue: {
    color: 'blue'
  },
  red: {
    color: 'red'
  }
})
  
export default defineComponent({
  setup() {
    const color = ref('red')
    const className = computed(() => stylex.props(styles.text, color.value === 'red' ? styles.red : styles.blue).className)
  
    const handleClick = () => {
      color.value = color.value === 'red' ? 'blue' : 'red'
    }
  
    return { className, handleClick }
  }
})
</script>
