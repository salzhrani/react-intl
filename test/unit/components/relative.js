import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import IntlProvider from '../../../src/components/provider';
import {IntlContext, getContext, Consumer } from '../../../src/context'
import FormattedRelative from '../../../src/components/relative';

describe('<FormattedRelative>', () => {
    const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

    let consoleError;
    let renderer;
    // let setState;

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error');
        renderer = Renderer.create;
        // setState     = jest.spyOn(FormattedRelative.prototype, 'setState');
    });

    afterEach(() => {
        consoleError.mockRestore();
        // setState.mockRestore();
    });

    it('has a `displayName`', () => {
        expect(typeof FormattedRelative.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedRelative />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('requires a finite `value` prop', async () => {
        renderer(<FormattedRelative value={0} />);
        expect(isFinite(0)).toBe(true);
        expect(consoleError.mock.calls.length).toBe(0);

        renderer(<FormattedRelative value={NaN} />);
        expect(consoleError.mock.calls.length).toBe(1);
        expect(consoleError.mock.calls[0][0]).toContain(
            '[React Intl] Error formatting relative time.\nRangeError'
        );

        // Should avoid update scheduling tight-loop.
        // await sleep(10);
        // expect(setState.calls.length).toBe(1, '`setState()` called unexpectedly');
    });

    it('renders a formatted relative time in a <span>', () => {
        const date = new Date();

        const el = renderer(<FormattedRelative value={date} />);

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatRelative(date)}</span>}</Consumer>).toJSON()
        );
    });

    it('should not re-render when props and context are the same', () => {
        let count = 0;
        const fn = () => {
            count++;
            return null;
        };
        const comp = renderer(
            <FormattedRelative value={0}>{fn}</FormattedRelative>
        );
        expect(count).toBe(1);
        comp.update(<FormattedRelative value={0}>{fn}</FormattedRelative>);
        expect(count).toBe(1);
    });

    it('should re-render when props change', () => {
        let count = 0;
        const fn = () => {
            count++;
            return null;
        };
        const comp = renderer(
            <FormattedRelative value={0}>{fn}</FormattedRelative>
        );
        expect(count).toBe(1);
        comp.update(<FormattedRelative value={1000}>{fn}</FormattedRelative>);
        expect(count).toBe(2);
    });

    it('should re-render when context changes', () => {
        let count = 0;
        const fn = () => {
            count++;
            return null;
        };
        const comp = renderer(
            <IntlProvider locale="en">
                <FormattedRelative value={0}>{fn}</FormattedRelative>
            </IntlProvider>
        );
        expect(count).toBe(1);
        comp.update(
            <IntlProvider locale="en-us">
                <FormattedRelative value={1000}>{fn}</FormattedRelative>
            </IntlProvider>
        );
        expect(count).toBe(2);
    });

    it('accepts valid IntlRelativeFormat options as props', () => {
        const date = Date.now() - 60 * 1000;
        const options = { units: 'second' };

        const el = renderer(<FormattedRelative value={date} {...options} />);

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatRelative(date, options)}</span>}</Consumer>).toJSON()
        );
    });

    it('fallsback and warns on invalid IntlRelativeFormat options', () => {
        const el = renderer(<FormattedRelative value={0} units="invalid" />);

        expect(el.toJSON()).toEqual(
            renderer(<span>{String(new Date(0))}</span>).toJSON()
        );

        expect(consoleError.mock.calls.length).toBeGreaterThan(0);
    });

    it('accepts `format` prop', () => {
        const date = Date.now() - 60 * 1000;
        const format = 'seconds';

        const el = renderer(
            <IntlProvider
                locale="en"
                formats={{
                    relative: {
                        seconds: {
                            units: 'second'
                        }
                    }
                }}
            >
                <FormattedRelative value={date} format={format} />
            </IntlProvider>
        );

        expect(el.toJSON()).toEqual(
            renderer(<IntlProvider
                locale="en"
                formats={{
                    relative: {
                        seconds: {
                            units: 'second'
                        }
                    }
                }}
            >
                <Consumer>{intl => <span>{intl.formatRelative(date, { format })}</span>}</Consumer></IntlProvider>
            ).toJSON()
        );
    });

    it('accepts `initialNow` prop', () => {
        const date = 0;
        const now = 1000;

        expect(now).not.toEqual(Date.now());

        const el = renderer(
            <FormattedRelative value={date} initialNow={now} />
        );

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatRelative(date, { now })}</span>}</Consumer>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const date = new Date();

        const el = renderer(
            <FormattedRelative value={date}>
                {formattedRelative => <b>{formattedRelative}</b>}
            </FormattedRelative>
        );

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <b>{intl.formatRelative(date)}</b>}</Consumer>).toJSON()
        );
    });

    it('updates automatically', async () => {
        jest.useFakeTimers();
        const intl = getContext();
        const date = new Date();
        const nowMock = jest.spyOn(intl, 'now');
        const el = (
            <IntlContext.Provider value={intl}>
                <FormattedRelative value={date} updateInterval={1} />
            </IntlContext.Provider>
        );
        let renderedOne;
        act(() => {
            renderedOne = renderer(el);
        });
        const renderedOneJson = renderedOne.toJSON();
        act(() => {
            jest.runAllTimers();
        });
        nowMock.mockReturnValue(
            nowMock.mock.results[nowMock.mock.results.length - 1].value + 1000
        );

        act(() => {
            renderedOne.update(
                <IntlContext.Provider value={intl}>
                    <FormattedRelative value={date} updateInterval={1} />
                </IntlContext.Provider>
            );
            jest.runAllTimers();
        });
        const renderedTwoJson = renderedOne.toJSON();
        expect(renderedTwoJson).not.toEqual(renderedOneJson);
        expect(renderedTwoJson).toEqual(
            renderer(
                <span>{intl.formatRelative(date, { now: intl.now() })}</span>
            ).toJSON()
        );
    });

    it('updates when the `value` prop changes', () => {
        jest.useFakeTimers();
        const intl = getContext();
        const now = intl.now();
        const nowMock = jest.spyOn(intl, 'now');

        let comp;
        comp = renderer(
            <IntlContext.Provider value={intl}>
                <FormattedRelative value={now} updateInterval={1} />
            </IntlContext.Provider>
        );
        const renderedOne = comp.toJSON();
        console.log('after first render', nowMock.mock.calls);
        // Update `now()` to act like the <IntlProvider> is mounted.
        const nextNow = nowMock.mock.results[0].value + 1000;
        // intl.now = () => {
        //     console.log('shifted');
        //     return nextNow;
        // };
        nowMock.mockReturnValue(nextNow);
        act(() => {
            jest.runAllTimers();
        });
        act(() => {
            comp.update(
                <IntlContext.Provider value={intl}>
                    <FormattedRelative value={nextNow} updateInterval={1} />
                </IntlContext.Provider>
            );
        });
        console.log('after second render', nowMock.mock.calls);
        console.log(nowMock.mock.results);
        const renderedTwo = comp.toJSON();
        expect(renderedTwo).toEqual(renderedOne);
    });

    it('updates at maximum of `updateInterval` with a string `value`', () => {
        const intl = getContext();

        // `toString()` rounds the date to the nearest second, this makes sure
        // `date` and `now` are exactly 1000ms apart so the scheduler will wait
        // 1000ms before the next interesting moment.
        const now = 2000;
        const date = new Date(now - 1000).toString();

        const mockedNow = jest.spyOn(intl, 'now');
        act(() => {
            renderer(
                <IntlContext.Provider value={intl}>
                    <FormattedRelative value={date} updateInterval={1} />
                </IntlContext.Provider>
            );
        });
        // setTimeout(() => {
        // Make sure setTimeout wasn't called with `NaN`, which is like `0`.
        expect(mockedNow.mock.calls.length).toBe(1);

        // }, 10);
    });

    it('does not update when `updateInterval` prop is falsy', () => {
        const intl = getContext();
        const date = new Date();
        const mockedNow = jest.spyOn(intl, 'now');
        let comp;
        act(() => {
            comp = renderer(
                <IntlContext.Provider value={intl}>
                    <FormattedRelative value={date} updateInterval={0} />
                </IntlContext.Provider>
            );
        });
        const renderedOne = comp.toJSON();

        // Update `now()` to act like the <IntlProvider> is mounted.
        mockedNow.mockReturnValue(mockedNow.mock.results[0].value + 1000);
        act(() => {
            jest.runAllTimers();
        });

        const renderedTwo = comp.toJSON();

        expect(renderedTwo).toEqual(renderedOne);
        expect(renderedTwo).not.toEqual(
            renderer(
                <IntlContext.Provider value={intl}>
                    <span>
                        {intl.formatRelative(date, { now: intl.now() })}
                    </span>
                </IntlContext.Provider>
            ).toJSON()
        );
    });
});
