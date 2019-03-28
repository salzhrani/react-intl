import expect from 'expect';
import React from 'react';
import Renderer from 'react-test-renderer';
import IntlProvider from '../../../src/components/provider';
import {IntlContext, Consumer} from '../../../src/context';
import FormattedNumber from '../../../src/components/number';


describe('<FormattedNumber>', () => {
    let consoleError;
    let renderer;

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error');
        renderer     = Renderer.create;
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    it('has a `displayName`', () => {
        expect(typeof FormattedNumber.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedNumber />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('renders "NaN" in a <span> when no `value` prop is provided', () => {
        const comp1 = renderer(<FormattedNumber />);
        expect(comp1.toJSON()).toEqual(renderer(<span>NaN</span>).toJSON());
    });

    it('renders a formatted number in a <span>', () => {
        const num = 1000;

        const el = renderer(<FormattedNumber value={num} />);

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatNumber(num)}</span>}</Consumer>).toJSON()
        );
    });

    it('should not re-render when props and context are the same', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<FormattedNumber value={1000}>{fn}</FormattedNumber>);
        expect(count).toBe(1);
        comp.update(<FormattedNumber value={1000}>{fn}</FormattedNumber>);
        expect(count).toBe(1);
    });

    it('should re-render when props change', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<FormattedNumber value={1000}>{fn}</FormattedNumber>);
        expect(count).toBe(1);
        comp.update(<FormattedNumber value={2000}>{fn}</FormattedNumber>);
        expect(count).toBe(2);
    });

    it('should re-render when context changes', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<IntlProvider locale="en"><FormattedNumber value={1000}>{fn}</FormattedNumber></IntlProvider>);
        expect(count).toBe(1);
        comp.update(<IntlProvider locale="en-US"><FormattedNumber value={1000}>{fn}</FormattedNumber></IntlProvider>);
        expect(count).toBe(2);
    });

    it('accepts valid Intl.NumberFormat options as props', () => {
        const num = 0.5;
        const options = {style: 'percent'};

        const el = renderer(<FormattedNumber value={num} {...options} />);

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatNumber(num, options)}</span>}</Consumer>).toJSON()
        );
    });

    it('fallsback and warns on invalid Intl.NumberFormat options', () => {
        const el = <FormattedNumber value={0} style="invalid" />;

        const comp = renderer(el);
        expect(comp.toJSON()).toEqual(
            renderer(<span>{String(0)}</span>).toJSON()
        );

        expect(consoleError.mock.calls.length).toBeGreaterThan(0);
    });

    it('accepts `format` prop', () => {
        const num   = 0.505;
        const format = 'percent';

        const el = <IntlProvider locale="en" formats={{number: {
                    'percent': {
                        style: 'percent',
                        minimumFractionDigits: 2,
                    },
                }}}><FormattedNumber value={num} format={format} /></IntlProvider>;

        const comp = renderer(el);
        expect(comp.toJSON()).toEqual(
            renderer(<IntlProvider locale="en" formats={{number: {
                    'percent': {
                        style: 'percent',
                        minimumFractionDigits: 2,
                    },
                }}}><Consumer>{intl => <span>{intl.formatNumber(num, {format})}</span>}</Consumer></IntlProvider>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const num   = new Date();
        const el = (
            <FormattedNumber value={num}>
                {(formattedNumber) => (
                    <b>{formattedNumber}</b>
                )}
            </FormattedNumber>
        );

        const comp = renderer(el);
        expect(comp.toJSON()).toEqual(
            renderer(<Consumer>{intl => <b>{intl.formatNumber(num)}</b>}</Consumer>).toJSON()
        );
    });
});
