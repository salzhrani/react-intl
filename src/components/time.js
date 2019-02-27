/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, { useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { dateTimeFormatPropTypes } from '../types';
import { IntlContext } from './provider';

const FormattedTime = memo(props => {
    const intl = useContext(IntlContext);
    const { formatTime, textComponent: Text } = intl;
    const { value, children } = props;

    let formattedTime = formatTime(value, props);

    if (typeof children === 'function') {
        return children(formattedTime);
    }

    return <Text>{formattedTime}</Text>;
});

FormattedTime.displayName = 'FormattedTime';

FormattedTime.propTypes = {
    ...dateTimeFormatPropTypes,
    value: PropTypes.any.isRequired,
    format: PropTypes.string,
    children: PropTypes.func
};

export default FormattedTime;
