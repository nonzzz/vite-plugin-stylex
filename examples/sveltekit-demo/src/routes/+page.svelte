<script lang="ts">
	let count = 0;
	const incr = () => count++;
	const decr = () => count--;
</script>


<h1 {...attrs(stylex.props(styles.foo))}>SvelteKit ♥️ StyleX</h1>
<div>
	<button on:click={decr}>-</button>
	{count}
	<button on:click={incr}>+</button>
</div>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<script context="module" lang="ts">
	import * as stylex from '@stylexjs/stylex';
  import {globalTokens} from '../styles/globalTokens.stylex';
  import {attrs} from '../styles/utils';

  const styles = stylex.create({
    foo: {
      color: globalTokens.green,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 200,
      fontSize: '4rem',
    },
  });
</script>