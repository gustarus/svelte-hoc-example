<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let settings;
  export let disabled = false;

  function onClick(e) {
    e.preventDefault();
    dispatch('toggle', { disabled });
  }
</script>

<div>
  <label>
    <input type="checkbox" bind:checked={disabled} />
    Button is {disabled ? 'disabled' : 'enabled'}
  </label>
</div>

<button {disabled} on:click={onClick}>Click me</button>
