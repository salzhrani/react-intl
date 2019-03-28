import expect from 'expect';
import React from 'react';
import Renderer from 'react-test-renderer';
import IntlProvider from '../../../src/components/provider';
import { Consumer } from '../../../src/context';
import FormattedPlural from '../../../src/components/plural';


describe('<FormattedPlural>', () => {
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
        expect(typeof FormattedPlural.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedPlural />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('renders an empty <span> when no `other` prop is provided', () => {

        const compOne = renderer(<FormattedPlural />);
        expect(compOne.toJSON()).toEqual(renderer(<span />).toJSON());

        const compTwo = renderer(<FormattedPlural value={1} />);
        expect(compTwo.toJSON()).toEqual(renderer(<span />).toJSON());
    });

    it('renders `other` in a <span> when no `value` prop is provided', () => {
        expect(renderer(<FormattedPlural other="foo" />).toJSON()).toEqual(renderer(<span>foo</span>).toJSON());
    });

    it('renders a formatted plural in a <span>', () => {
        const num = 1;

        const el = renderer(<FormattedPlural value={num} one="foo" other="bar" />);
        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{el.root.props[intl.formatPlural(num)]}</span>}</Consumer>).toJSON()
        );
    });

    it('should not re-render when props and context are the same', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<FormattedPlural value={0} other="foo">{fn}</FormattedPlural>);
        expect(count).toBe(1);
        comp.update(<FormattedPlural value={0} other="foo">{fn}</FormattedPlural>);
        expect(count).toBe(1);
    });

    it('should re-render when props change', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<FormattedPlural value={0} other="foo">{fn}</FormattedPlural>);
        expect(count).toBe(1);
        comp.update(<FormattedPlural value={1} other="foo">{fn}</FormattedPlural>);
        expect(count).toBe(2);
    });

    it('should re-render when context changes', () => {
        let count = 0;
        const fn = ()=> { count++; return null};
        const comp = renderer(<IntlProvider locale="en"><FormattedPlural value={0} other="foo">{fn}</FormattedPlural></IntlProvider>);
        expect(count).toBe(1);
        comp.update(<IntlProvider locale="en-Us"><FormattedPlural value={0} other="foo">{fn}</FormattedPlural></IntlProvider>);
        expect(count).toBe(2);
    });

    it('accepts valid IntlPluralFormat options as props', () => {
        const num = 22;
        const options = {style: 'ordinal'};

        const el = renderer(<FormattedPlural value={num} two="nd" {...options} />);

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <span>{el.root.props[intl.formatPlural(num, options)]}</span>}</Consumer>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const num = 1;

        const el = renderer(
            <FormattedPlural value={num} one="foo">
                {(formattedPlural) => (
                    <b>{formattedPlural}</b>
                )}
            </FormattedPlural>
        );

        expect(el.toJSON()).toEqual(
            renderer(<Consumer>{intl => <b>{el.root.props[intl.formatPlural(num)]}</b>}</Consumer>).toJSON()
        );
    });
});
