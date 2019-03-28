/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {PureComponent, Children} from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import {IntlContext, getFormatters, getContext} from '../context';
import {intlConfigPropTypes} from '../types';

export default class IntlProvider extends PureComponent {
  static displayName = 'IntlProvider';

  static propTypes = {
    ...intlConfigPropTypes,
    children: PropTypes.element.isRequired,
    initialNow: PropTypes.any,
  };

  constructor(props) {
    super(props);

    invariant(
      typeof Intl !== 'undefined',
      '[React Intl] The `Intl` APIs must be available in the runtime, ' +
        'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' +
        'See: http://formatjs.io/guides/runtime-environments/'
    );

    // const {intl: intlContext} = context;

    // Used to stabilize time when performing an initial rendering so that
    // all relative times use the same reference "now" time.
    let initialNow;
    if (isFinite(props.initialNow)) {
      initialNow = Number(props.initialNow);
    } else {
      // When an `initialNow` isn't provided via `props`, look to see an
      // <IntlProvider> exists in the ancestry and call its `now()`
      // function to propagate its value for "now".
      initialNow = Date.now();
    }

    // Creating `Intl*` formatters is expensive. If there's a parent
    // `<IntlProvider>`, then its formatters will be used. Otherwise, this
    // memoize the `Intl*` constructors and cache them for the lifecycle of
    // this IntlProvider instance.

    this.state = {
      ...getFormatters(),

      // Wrapper to provide stable "now" time for initial render.
      now: () => {
        return this._didDisplay ? Date.now() : initialNow;
      },
    };
  }

  componentDidMount() {
    this._didDisplay = true;
  }

  render() {
    return (
      <IntlContext.Provider value={getContext(this.props, this.state)}>
        {Children.only(this.props.children)}
      </IntlContext.Provider>
    );
  }
}

export const Consumer = IntlContext.Consumer;
