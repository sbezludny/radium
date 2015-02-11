var forEach = require('lodash.foreach');
var merge = require('lodash.merge');

var StyleResolverMixin = {
  _getStateStyles: function (states) {
    if (!states) {
      return;
    }

    var stateStyles;

    if (this.state.active) {
      stateStyles = states.active;
    } else if (this.state.focus) {
      stateStyles = states.focus;
    } else if (this.state.hover) {
      stateStyles = states.hover;
    }

    return stateStyles;
  },

  _getBreakpointStyles: function (styles) {
    var breakpointStyles = merge({}, styles);
    var componentBreakpoints = this.props.breakpoints;

    if (this.state && this.state.breakpoints) {
      componentBreakpoints = this.state.breakpoints;
    }

    forEach(styles.breakpoints, function (breakpoint, key) {
      if (componentBreakpoints && componentBreakpoints[key]) {
        var activeBreakpoint = breakpoint;

        if (!activeBreakpoint) {
          return;
        }

        merge(
          breakpointStyles,
          activeBreakpoint
        );
      }
    }, this);

    breakpointStyles.breakpoints = null;

    return breakpointStyles;
  },

  _getModifierStyles: function (styles) {
    var modifierStyles = merge({}, styles.standard);

    forEach(styles.modifiers, function (modifier, key) {
      if (this.props[key]) {
        var modifierValue = this.props[key];
        var activeModifier;

        if (typeof modifierValue === 'string') {
          activeModifier = modifier[modifierValue];
        } else if (modifierValue === true || modifierValue === false) {
          activeModifier = modifier;
        } else {
          return;
        }

        if (!activeModifier) {
          return;
        }

        merge(
          modifierStyles,
          activeModifier
        );
      }
    }, this);

    return modifierStyles;
  },

  _getStaticStyles: function (styles) {
    var elementStyles = this._getModifierStyles(styles);
    var mediaQueryStyles = this._getBreakpointStyles(elementStyles);

    return merge(
      {},
      mediaQueryStyles,
      this.props.style,
      this._getStateStyles(mediaQueryStyles.states),
      { states: null }
    );
  },

  _getComputedStyles: function (styles) {
    var computedStyles = {};

    // `styles.computed` can be a function that returns a style object.
    if (typeof styles.computed === 'function') {
      computedStyles = styles.computed(styles);
    // or it can be an object of functions mapping to individual rules.
    } else {
      forEach(styles.computed, function (computedCallback, key) {
        computedStyles[key] = computedCallback(styles);
      });
    }

    return merge(
      {},
      styles,
      computedStyles,
      { computed: null }
    );
  },

  buildStyles: function (styles) {
    var staticStyles = this._getStaticStyles(styles);

    return this._getComputedStyles(staticStyles);
  }
};

module.exports = StyleResolverMixin;
