I've found a "solution" for svelte hoc to proxy all events, all properties and specified `bind:*` properties.
Bad or good - I don't know, but it works good for my project (`svelte@3.12.1`).
Unfortunately, currently `bind:name` works only if you define this property as `export let name` inside [WithSettingsComponent.svelte](src/hocs/withSettings/WithSettingsComponent/WithSettingsComponent.svelte).

#### Backstory  
We have components library and every component can use another component, for example, `ContactForm` uses `Button` inside. Every component can "load" `settings` for child components. From my opinion `HOC` will be quite good decision to avoid extra code lines like `{#if settings.button} <Button bind:settings={settings.button} /> {/if}` inside components. So, I've decided to implement `HOC` for components which have `settings` property and I do not want to render component until I received `settings`.

#### Conception  
The conception looks like this
`components/Button/index.js`
```
import Component from './Control.svelte';

export default withSettings(Component);
```

#### Implementation
Currently we have this folders structure.
```
- hocs
- - withSettings
- - - index.js (just `export default`)
- - - withSettings.js (see code below)
- - - WithSettingsComponet
- - - - index.js (just `export default`)
- - - - WithSettingsComponent.svelte (see code below)
```

`hocs/withSettings/withSettings.js`
```javascript
import WithSettingsComponent from './WithSettingsComponent';

export default function withSettings(Component) {
  // create wrapper for component constructor
  const creator = function (context) {
    context.props = context.props || {};
    context.props._component = Component;
    return new WithSettingsComponent(context);
  };

  // proxy all exported module context properties to the wrapper
  for (const property in Component.prototype.constructor) {
    if (Component.prototype.constructor.hasOwnProperty(property)) {
      creator[property] = Component.prototype.constructor[property];
    }
  }

  return creator;
}
```


`hocs/withSettings/WithSettingsComponent/WithSettingsComponent.svelte`
```html
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
```
