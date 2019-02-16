/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {dateTimeFormatPropTypes} from '../types';
import {Consumer} from './provider';

export default class FormattedDate extends PureComponent {
  static displayName = 'FormattedDate';

  static propTypes = {
    ...dateTimeFormatPropTypes,
    value: PropTypes.any.isRequired,
    format: PropTypes.string,
    children: PropTypes.func,
  };

  render() {
    return (
      <Consumer>
        {intl => {
          const {formatDate, textComponent: Text} = intl;
          const {value, children} = this.props;
          let formattedDate = formatDate(value, this.props);

          if (typeof children === 'function') {
            return children(formattedDate);
          }
          return <Text>{formattedDate}</Text>;
        }}
      </Consumer>
    );
  }
}
