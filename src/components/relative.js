/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {useContext, useEffect, useState, memo} from 'react';
import PropTypes from 'prop-types';
import {relativeFormatPropTypes} from '../types';
import {IntlContext} from '../context';

const SECOND = 1000;
const MINUTE = 1000 * 60;
const HOUR = 1000 * 60 * 60;
const DAY = 1000 * 60 * 60 * 24;

// The maximum timer delay value is a 32-bit signed integer.
// See: https://mdn.io/setTimeout
const MAX_TIMER_DELAY = 2147483647;

function selectUnits(delta) {
  let absDelta = Math.abs(delta);

  if (absDelta < MINUTE) {
    return 'second';
  }

  if (absDelta < HOUR) {
    return 'minute';
  }

  if (absDelta < DAY) {
    return 'hour';
  }

  // The maximum scheduled delay will be measured in days since the maximum
  // timer delay is less than the number of milliseconds in 25 days.
  return 'day';
}

function getUnitDelay(units) {
  switch (units) {
    case 'second':
      return SECOND;
    case 'minute':
      return MINUTE;
    case 'hour':
      return HOUR;
    case 'day':
      return DAY;
    default:
      return MAX_TIMER_DELAY;
  }
}

// function isSameDate(a, b) {
//     if (a === b) {
//         return true;
//     }

//     let aTime = new Date(a).getTime();
//     let bTime = new Date(b).getTime();

//     return isFinite(aTime) && isFinite(bTime) && aTime === bTime;
// }

const SFC = memo(props => {
  const intl = useContext(IntlContext);
  const {formatRelative, textComponent: Text, now: nowFn} = intl;
  const [now, setNow] = useState(() => {
    return isFinite(props.initialNow) ? Number(props.initialNow) : nowFn();
  });
  const {value, children, units, updateInterval} = props;
  useEffect(() => {
    const time = new Date(value).getTime();

    // If the `updateInterval` is falsy, including `0` or we don't have a
    // valid date, then auto updates have been turned off, so we bail and
    // skip scheduling an update.
    if (!updateInterval || !isFinite(time)) {
      return;
    }

    const delta = time - now;
    const unitDelay = getUnitDelay(units || selectUnits(delta));
    const unitRemainder = Math.abs(delta % unitDelay);

    // We want the largest possible timer delay which will still display
    // accurate information while reducing unnecessary re-renders. The delay
    // should be until the next "interesting" moment, like a tick from
    // "1 minute ago" to "2 minutes ago" when the delta is 120,000ms.
    const delay =
      delta < 0
        ? Math.max(updateInterval, unitDelay - unitRemainder)
        : Math.max(updateInterval, unitRemainder);
    let timer = setTimeout(() => {
      setNow(nowFn());
    }, delay);
    return () => {
      clearInterval(timer);
    };
  }, [value, units, updateInterval, now]);
  let formattedRelative = formatRelative(value, {
    ...props,
    now,
  });

  if (typeof children === 'function') {
    return children(formattedRelative);
  }
  return <Text>{formattedRelative}</Text>;
});

// class FormattedRelative extends PureComponent {
//     constructor(props) {
//         super(props);

//         let now = isFinite(props.initialNow)
//             ? Number(props.initialNow)
//             : props.intl.now();

//         // `now` is stored as state so that `render()` remains a function of
//         // props + state, instead of accessing `Date.now()` inside `render()`.
//         this.state = { now };
//     }

//     scheduleNextUpdate(props, state) {
//         // Cancel and pending update because we're scheduling a new update.
//         clearTimeout(this._timer);

//         const { value, units, updateInterval } = props;
//         const time = new Date(value).getTime();

//         // If the `updateInterval` is falsy, including `0` or we don't have a
//         // valid date, then auto updates have been turned off, so we bail and
//         // skip scheduling an update.
//         if (!updateInterval || !isFinite(time)) {
//             return;
//         }

//         const delta = time - state.now;
//         const unitDelay = getUnitDelay(units || selectUnits(delta));
//         const unitRemainder = Math.abs(delta % unitDelay);

//         // We want the largest possible timer delay which will still display
//         // accurate information while reducing unnecessary re-renders. The delay
//         // should be until the next "interesting" moment, like a tick from
//         // "1 minute ago" to "2 minutes ago" when the delta is 120,000ms.
//         const delay =
//             delta < 0
//                 ? Math.max(updateInterval, unitDelay - unitRemainder)
//                 : Math.max(updateInterval, unitRemainder);

//         this._timer = setTimeout(() => {
//             this.setState({ now: this.props.intl.now() });
//         }, delay);
//     }

//     componentDidMount() {
//         this.scheduleNextUpdate(this.props, this.state);
//     }
//     static getDerivedStateFromProps({ value: nextValue }, state) {
//         // When the `props.value` date changes, `state.now` needs to be updated,
//         // and the next update can be rescheduled.
//         if (!isSameDate(nextValue, state.prevValue)) {
//             return { now: this.props.intl.now(), prevValue: nextValue };
//         }
//         return null;
//     }

//     componentDidUpdate(nextProps, nextState) {
//         this.scheduleNextUpdate(nextProps, nextState);
//     }

//     componentWillUnmount() {
//         clearTimeout(this._timer);
//     }

//     render() {
//         const { formatRelative, textComponent: Text } = this.props.intl;
//         const { value, children } = this.props;

//         let formattedRelative = formatRelative(value, {
//             ...this.props,
//             ...this.state
//         });

//         if (typeof children === 'function') {
//             return children(formattedRelative);
//         }
//         return <Text>{formattedRelative}</Text>;
//     }
// }

// const Wrapped = ({ children, ...rest }) => (
//     <IntlProvider>
//         {intl => {
//             return (
//                 <FormattedRelative {...rest} intl={intl}>
//                     {children}
//                 </FormattedRelative>
//             );
//         }}
//     </IntlProvider>
// );

SFC.displayName = 'FormattedRelative';

SFC.propTypes = {
  ...relativeFormatPropTypes,
  value: PropTypes.any.isRequired,
  format: PropTypes.string,
  updateInterval: PropTypes.number,
  initialNow: PropTypes.any,
  children: PropTypes.func,
};

SFC.defaultProps = {
  updateInterval: 1000 * 10,
};

export default SFC;
