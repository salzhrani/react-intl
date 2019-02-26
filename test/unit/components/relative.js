import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import IntlProvider, {
    getContext,
    IntlContext
} from '../../../src/components/provider';
import FormattedRelative from '../../../src/components/relative';

describe('<FormattedRelative>', () => {
    const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

    let consoleError;
    let renderer;
    let intlProvider;
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
        const intl = getContext();
        const date = new Date();

        const el = renderer(<FormattedRelative value={date} />);

        expect(el.toJSON()).toEqual(
            renderer(<span>{intl.formatRelative(date)}</span>).toJSON()
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
        const intl = getContext();
        const date = intl.now() - 60 * 1000;
        const options = { units: 'second' };

        const el = renderer(<FormattedRelative value={date} {...options} />);

        expect(el.toJSON()).toEqual(
            renderer(<span>{intl.formatRelative(date, options)}</span>).toJSON()
        );
    });

    it('fallsback and warns on invalid IntlRelativeFormat options', () => {
        const intl = getContext();
        const el = renderer(<FormattedRelative value={0} units="invalid" />);

        expect(el.toJSON()).toEqual(
            renderer(<span>{String(new Date(0))}</span>).toJSON()
        );

        expect(consoleError.mock.calls.length).toBeGreaterThan(0);
    });

    it('accepts `format` prop', () => {
        const intl = getContext({
            locale: 'en',
            formats: {
                relative: {
                    seconds: {
                        units: 'second'
                    }
                }
            }
        });
        const date = intl.now() - 60 * 1000;
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
            renderer(
                <span>{intl.formatRelative(date, { format })}</span>
            ).toJSON()
        );
    });

    it('accepts `initialNow` prop', () => {
        const intl = getContext();
        const date = 0;
        const now = 1000;

        expect(now).not.toEqual(intl.now());

        const el = renderer(
            <FormattedRelative value={date} initialNow={now} />
        );

        expect(el.toJSON()).toEqual(
            renderer(<span>{intl.formatRelative(date, { now })}</span>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const intl = getContext();
        const date = new Date();

        const el = renderer(
            <FormattedRelative value={date}>
                {formattedRelative => <b>{formattedRelative}</b>}
            </FormattedRelative>
        );

        expect(el.toJSON()).toEqual(
            renderer(<b>{intl.formatRelative(date)}</b>).toJSON()
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
        const { intl } = intlProvider.getChildContext();
        const now = intl.now();

        renderer.render(<FormattedRelative value={now} updateInterval={1} />, {
            intl
        });
        const renderedOne = renderer.getRenderOutput();

        // Shallow Renderer doesn't call `componentDidMount()`. This forces the
        // scheduler to schedule an update based on the `updateInterval`.
        renderer.getMountedInstance().componentDidMount();

        // Update `now()` to act like the <IntlProvider> is mounted.
        const nextNow = now + 1000;
        intl.now = () => nextNow;

        renderer.render(
            <FormattedRelative value={nextNow} updateInterval={1} />,
            { intl }
        );
        const renderedTwo = renderer.getRenderOutput();

        expect(renderedTwo).toEqualJSX(renderedOne);

        renderer.unmount();
    });

    it('updates at maximum of `updateInterval` with a string `value`', done => {
        const { intl } = intlProvider.getChildContext();

        // `toString()` rounds the date to the nearest second, this makes sure
        // `date` and `now` are exactly 1000ms apart so the scheduler will wait
        // 1000ms before the next interesting moment.
        const now = 2000;
        const date = new Date(now - 1000).toString();

        spyOn(intl, 'now').andReturn(now);

        renderer.render(<FormattedRelative value={date} updateInterval={1} />, {
            intl
        });

        // Shallow Renderer doesn't call `componentDidMount()`. This forces the
        // scheduler to schedule an update based on the `updateInterval`.
        renderer.getMountedInstance().componentDidMount();

        setTimeout(() => {
            // Make sure setTimeout wasn't called with `NaN`, which is like `0`.
            expect(intl.now.calls.length).toBe(1);

            renderer.unmount();
            done();
        }, 10);
    });

    it('does not update when `updateInterval` prop is falsy', done => {
        const { intl } = intlProvider.getChildContext();
        const date = new Date();
        const now = intl.now();

        renderer.render(<FormattedRelative value={date} updateInterval={0} />, {
            intl
        });
        const renderedOne = renderer.getRenderOutput();

        // Shallow Renderer doesn't call `componentDidMount()`. This forces the
        // scheduler to schedule an update based on the `updateInterval`.
        renderer.getMountedInstance().componentDidMount();

        // Update `now()` to act like the <IntlProvider> is mounted.
        intl.now = () => now + 1000;

        setTimeout(() => {
            const renderedTwo = renderer.getRenderOutput();

            expect(renderedTwo).toEqualJSX(renderedOne);
            expect(renderedTwo).toNotEqualJSX(
                <span>{intl.formatRelative(date, { now: intl.now() })}</span>
            );

            renderer.unmount();
            done();
        }, 10);
    });
});
