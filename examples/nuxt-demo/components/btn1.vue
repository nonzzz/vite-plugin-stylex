<template>
  <button :class="stylex(btns.button, isPressed && btns.pressed)" @click="isPressed = !isPressed">click me</button>
</template>
  
<script lang="ts">
import stylex from '@stylexjs/stylex'

const btns = stylex.create({
  button: {
    transition: '.150s all',
    border: '3px solid blue',
    backgroundColor: 'CornflowerBlue'
  },
  pressed: {
    backgroundColor: 'aquamarine'
  }
})
</script>
  
<script setup lang="ts">
const isPressed = ref(false)
</script>
