import {createContext} from 'react';
import IntlMessageFormat from 'intl-messageformat';
import IntlRelativeFormat from 'intl-relativeformat';
import IntlPluralFormat from './plural';
import memoizeIntlConstructor from 'intl-format-cache';
import {createError, defaultErrorHandler, filterProps} from './utils';
import * as format from './format';
import {hasLocaleData} from './locale-data-registry';

import {intlConfigPropTypes, intlFormatPropTypes} from './types';

// These are not a static property on the `IntlProvider` class so the intl
// config values can be inherited from an <IntlProvider> ancestor.
const defaultProps = {
  formats: {},
  messages: {},
  timeZone: null,
  textComponent: 'span',

  defaultLocale: 'en',
  defaultFormats: {},

  onError: defaultErrorHandler,
};

const intlConfigPropNames = Object.keys(intlConfigPropTypes);
const intlFormatPropNames = Object.keys(intlFormatPropTypes);

const getBoundFormatFns = (config, state) => {
  return intlFormatPropNames.reduce((boundFormatFns, name) => {
    boundFormatFns[name] = format[name].bind(null, config, state);
    return boundFormatFns;
  }, {});
};

const getConfig = (props, skipLocaleWarning) => {
  // Build a whitelisted config object from `props`, defaults, and
  let config = filterProps(props, intlConfigPropNames);

  // Apply default props. This must be applied last after the props have
  // been resolved and inherited from any <IntlProvider> in the ancestry.
  // This matches how React resolves `defaultProps`.
  for (let propName in defaultProps) {
    if (config[propName] === undefined) {
      config[propName] = defaultProps[propName];
    }
  }

  if (!hasLocaleData(config.locale)) {
    const {locale, defaultLocale, defaultFormats, onError} = config;
    if (!skipLocaleWarning) {
      onError(
        createError(
          `Missing locale data for locale: "${locale}". ` +
            `Using default locale: "${defaultLocale}" as fallback.`
        )
      );
    }

    // Since there's no registered locale data for `locale`, this will
    // fallback to the `defaultLocale` to make sure things can render.
    // The `messages` are overridden to the `defaultProps` empty object
    // to maintain referential equality across re-renders. It's assumed
    // each <FormattedMessage> contains a `defaultMessage` prop.
    config = {
      ...config,
      locale: defaultLocale,
      formats: defaultFormats,
      messages: defaultProps.messages,
    };
  }

  return config;
};

export const getContext = (
  props = defaultProps,
  state = {
    ...getFormatters(),
    now: () => Date.now(),
  },
  skipLocaleWarning = false
) => {
  const config = getConfig(props, skipLocaleWarning);

  // Bind intl factories and current config to the format functions.
  const boundFormatFns = getBoundFormatFns(config, state);

  const {now, ...formatters} = state;

  return {
    ...config,
    ...boundFormatFns,
    formatters,
    now,
  };
};
let formatters = null;
export const getFormatters = () => {
  if (formatters === null) {
    formatters = {
      getDateTimeFormat: memoizeIntlConstructor(Intl.DateTimeFormat),
      getNumberFormat: memoizeIntlConstructor(Intl.NumberFormat),
      getMessageFormat: memoizeIntlConstructor(IntlMessageFormat),
      getRelativeFormat: memoizeIntlConstructor(IntlRelativeFormat),
      getPluralFormat: memoizeIntlConstructor(IntlPluralFormat),
    };
  }
  return formatters;
};

export const IntlContext = createContext(
  getContext(
    defaultProps,
    {
      ...getFormatters(),
      now: () => Date.now(),
    },
    true
  )
);

export const Consumer = IntlContext.Consumer;
