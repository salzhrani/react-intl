/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, { useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { numberFormatPropTypes } from '../types';
import { IntlContext } from './provider';

const FormattedNumber = memo(props => {
    const intl = useContext(IntlContext);
    const { formatNumber, textComponent: Text } = intl;
    const { children, value } = props;
    let formattedNumber = formatNumber(value, props);

    if (typeof children === 'function') {
        return children(formattedNumber);
    }

    return <Text>{formattedNumber}</Text>;
});

FormattedNumber.displayName = 'FormattedNumber';

FormattedNumber.propTypes = {
    ...numberFormatPropTypes,
    value: PropTypes.any.isRequired,
    format: PropTypes.string,
    children: PropTypes.func
};

export default FormattedNumber;
