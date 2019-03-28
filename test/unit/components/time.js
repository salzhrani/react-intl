import React from 'react';
import Renderer from 'react-test-renderer';
import IntlProvider from '../../../src/components/provider';
import {Consumer} from '../../../src/context';
import FormattedTime from '../../../src/components/time';


describe('<FormattedTime>', () => {
    let consoleError;
    let renderer;

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error');
        renderer = Renderer.create;
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    it('has a `displayName`', () => {
        expect(typeof FormattedTime.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedTime />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('requires a finite `value` prop', () => {
        renderer(<FormattedTime value={0} />);
        expect(isFinite(0)).toBe(true);
        expect(consoleError.mock.calls.length).toBe(0);

        renderer(<FormattedTime />);
        expect(consoleError.mock.calls.length).toBe(2);
        expect(consoleError.mock.calls[1][0]).toContain(
            '[React Intl] Error formatting time.\nRangeError'
        );
    });

    it('renders a formatted time in a <span>', () => {
        const date = new Date();

        const el = renderer(<FormattedTime value={date} />);
        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatTime(date)}</span>}</Consumer>).toJSON()
        );
    });

    it('should not re-render when props and context are the same', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(
            <FormattedTime value={0}>{fn}</FormattedTime>
        );
        expect(count).toBe(1);
        comp.update(
            <FormattedTime value={0}>{fn}</FormattedTime>
        );
        expect(count).toBe(1);
    });

    it('should re-render when props change', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(
            <FormattedTime value={0}>{fn}</FormattedTime>
        );
        expect(count).toBe(1);
        comp.update(
            <FormattedTime value={1}>{fn}</FormattedTime>
        );
        expect(count).toBe(2);
    });

    it('should re-render when context changes', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(
            <IntlProvider locale="en"><FormattedTime value={0}>{fn}</FormattedTime></IntlProvider>
        );
        expect(count).toBe(1);
        comp.update(
            <IntlProvider locale="en-US"><FormattedTime value={0}>{fn}</FormattedTime></IntlProvider>
        );
        expect(count).toBe(2);
    });

    it('accepts valid Intl.DateTimeFormat options as props', () => {
        const date = new Date();
        const options = { hour: '2-digit' };

        const el = <FormattedTime value={date} {...options} />;

        expect(renderer(el).toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{intl.formatTime(date, options)}</span>}</Consumer>).toJSON()
        );
    });

    it('fallsback and warns on invalid Intl.DateTimeFormat options', () => {
        const el = <FormattedTime value={0} hour="invalid" />;

        expect(renderer(el).toJSON()).toEqual(
            renderer(<span>{String(new Date(0))}</span>).toJSON()
        );

        expect(consoleError.mock.calls.length).toBeGreaterThan(0);
    });

    it('accepts `format` prop', () => {
    
        const date = new Date();
        const format = 'hour-only';

        const el = <IntlProvider locale="en" formats={{time: {
                        'hour-only': {
                            hour: '2-digit',
                            hour12: false
                        }
                    }}}><FormattedTime value={date} format={format} /></IntlProvider>;

        expect(renderer(el).toJSON()).toEqual(
            renderer(<IntlProvider locale="en" formats={{time: {
                        'hour-only': {
                            hour: '2-digit',
                            hour12: false
                        }
                    }}}><Consumer>{intl => <span>{intl.formatTime(date, { format })}</span>}</Consumer></IntlProvider>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const date = new Date();

        const el = (
            <FormattedTime value={date}>
                {formattedTime => <b>{formattedTime}</b>}
            </FormattedTime>
        );

        expect(renderer(el).toJSON()).toEqual(
            renderer(<Consumer>{intl => <b>{intl.formatTime(date)}</b>}</Consumer>).toJSON()
        );
    });
});
