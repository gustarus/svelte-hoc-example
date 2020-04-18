<script>
  import { beforeUpdate } from 'svelte';

  export let settings;
  export let disabled;

  // save arguments passed to the instance
  // eslint-disable-next-line
  const self = arguments[0];
  // eslint-disable-next-line
  const props = arguments[1];
  // eslint-disable-next-line
  const invalidate = arguments[2];

  // prettier-ignore
  if (!self || !props || !invalidate || !self.$$ || !self.$$.bound || !self.$$.callbacks) {
    // prettier-ignore
    throw new Error('Svelte api has been changed: there is no required arguments passed');
  }

  // eslint-disable-next-line
  const { _component, ...rest } = props;

  if (!_component) {
    // prettier-ignore
    throw new Error('Invalid component usage: should be used only from `withSettings` hoc');
  }

  let node;
  const bound = {};
  const changesCache = {};
  const Component = _component;

  /**
   * Trigger change event on bounded property with changes cache.
   * @param name
   * @param value
   */
  function change(name, value) {
    if (!changesCache[name]) {
      // lock this value as changed to prevent infinite loop
      changesCache[name] = true;
      // unlock this value after event loop
      setTimeout(() => (changesCache[name] = false), 0);
      // update self rest props
      invalidate(name, (rest[name] = value));
    }
  }

  // listen to component changes
  beforeUpdate(() => {
    // if bound child component node exists
    if (node) {

      // create handlers for all bounds through
      // because we want to avoid infinite data loop
      // and assign them to the child node
      for (const name in rest) {
        // create bound callback with debounce effect
        // to prevent infinite data loop
        bound[name] = bound[name] || change.bind(undefined, name);
        // override node bound callback
        node.$$.bound[name] = bound[name];
      }

      // with callbacks it is much easier
      // just override node callbacks collection
      node.$$.callbacks = self.$$.callbacks;
    }
  });
</script>

{#if settings}
  <Component bind:this={node} {...rest} />
{:else}
  Loading...
{/if}
