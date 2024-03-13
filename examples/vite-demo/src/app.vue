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
import { computed, onMounted } from 'vue'
import { Button } from '@internal/button'
import { Text } from '@internal/text'
import { styles } from './stylex'
import Card from './card.vue'

const cl = computed(() => stylex.props(styles.normal).className)

onMounted(() => {
  const button = new Button()
  button.render('action')
  const text = new Text()
  text.render('hello world')
})
</script>

<style scoped>
div {
  font-size: 20px;
}
</style>
