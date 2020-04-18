<script>
  import { onMount } from 'svelte';
  import Control from './components/Control'

  let disabled = false;
  let settings = false;

  function onToggle({ disabled }) {
    alert(`Control ${disabled ? 'disabled' : 'enabled'}. This event has been received from \`on:toggle\` handler`);
  }

  onMount(() => {
    // load anything here
    // simulate required loading
    setTimeout(() => {
      settings = {};
    }, 1000);
  })
</script>

<div>
  Button is {disabled ? 'disabled' : 'enabled'}. This value has been received from <code>bind:disabled</code> of the <code>Control</code>.
</div>

<br />
<br />

<Control bind:settings bind:disabled on:toggle={onToggle} />
