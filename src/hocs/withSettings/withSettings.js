import WithSettingsComponent from './WithSettingsComponent';

export default function withSettings(Component) {
  // create wrapper for component constructor
  const creator = function(context) {
    context.props = context.props || {};
    context.props._component = Component;
    return new WithSettingsComponent(context);
  };

  // proxy all exported module context properties to the wrapper
  for (const property in Component.prototype.constructor) {
    // eslint-disable-next-line
    if (Component.prototype.constructor.hasOwnProperty(property)) {
      creator[property] = Component.prototype.constructor[property];
    }
  }

  return creator;
}
