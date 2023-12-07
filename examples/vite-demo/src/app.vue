<template>
    <div :class="cl">
123
    </div>
</template>


<script setup>
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
    normal:{
        color:'red'
    }
})

import {computed} from 'vue'

const cl = computed(()=>stylex.props(styles.normal))

</script>
