/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {memo, useContext} from 'react';
import PropTypes from 'prop-types';
import {pluralFormatPropTypes} from '../types';
import {IntlContext} from '../context';

const FormattedPlural = memo(props => {
  const {formatPlural, textComponent: Text} = useContext(IntlContext);
  const {value, other, children} = props;

  let pluralCategory = formatPlural(value, props);
  let formattedPlural = props[pluralCategory] || other;

  if (typeof children === 'function') {
    return children(formattedPlural);
  }

  return <Text>{formattedPlural}</Text>;
});

FormattedPlural.displayName = 'FormattedPlural';
FormattedPlural.defaultProps = {
  style: 'cardinal',
};
FormattedPlural.propTypes = {
  ...pluralFormatPropTypes,
  value: PropTypes.any.isRequired,

  other: PropTypes.node.isRequired,
  zero: PropTypes.node,
  one: PropTypes.node,
  two: PropTypes.node,
  few: PropTypes.node,
  many: PropTypes.node,

  children: PropTypes.func,
};

export default FormattedPlural;
