import React from 'react';
import Renderer from 'react-test-renderer';
import { intlShape } from '../../src/types';
import { getContext } from '../../src/context';
import injectIntl from '../../src/inject';

describe('injectIntl()', () => {
    let Wrapped;
    let renderer;

    beforeEach(() => {
        Wrapped = () => <div />;
        Wrapped.displayName = 'Wrapped';
        Wrapped.propTypes = {
            intl: intlShape.isRequired
        };
        Wrapped.someNonReactStatic = {
            foo: true
        };

        renderer = Renderer.create;
    });

    it('allows introspection access to the wrapped component', () => {
        expect(injectIntl(Wrapped).WrappedComponent).toBe(Wrapped);
    });

    it('hoists non-react statics', () => {
        expect(injectIntl(Wrapped).someNonReactStatic.foo).toBe(true);
    });

    describe('displayName', () => {
        it('is descriptive by default', () => {
            expect(injectIntl(() => null).displayName).toBe(
                'InjectIntl(Component)'
            );
        });

        it("includes `WrappedComponent`'s `displayName`", () => {
            Wrapped.displayName = 'Foo';
            expect(injectIntl(Wrapped).displayName).toBe('InjectIntl(Foo)');
        });
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     const Injected = injectIntl(Wrapped);

    //     expect(() => renderer.render(<Injected />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('renders <WrappedComponent> with `intl` prop', () => {
        const intl = getContext();
        const Injected = injectIntl(Wrapped);
        expect(renderer(<Injected />).toJSON()).toEqual(
            renderer(<Wrapped intl={intl} />).toJSON()
        );
    });

    it('propagates all props to <WrappedComponent>', () => {
        const intl = getContext();
        const Injected = injectIntl(Wrapped);
        expect(renderer(<Injected foo="foo" />).toJSON()).toEqual(
            renderer(<Wrapped foo="foo" intl={intl} />).toJSON()
        );
    });

    describe('options', () => {
        describe('intlPropName', () => {
            it("sets <WrappedComponent>'s `props[intlPropName]` to `context.intl`", () => {
                const intl = getContext();
                const Injected = injectIntl(Wrapped, {
                    intlPropName: 'myIntl'
                });

                expect(renderer(<Injected />).toJSON()).toEqual(
                    renderer(<Wrapped myIntl={intl} />).toJSON()
                );
            });
        });

        describe('withRef', () => {
            it('throws when `false` and getWrappedInstance() is called', () => {
                const Injected = injectIntl(Wrapped);
                const instance = new Injected();

                expect(() => instance.getWrappedInstance()).toThrow(
                    '[React Intl] To access the wrapped instance, the `{withRef: true}` option must be set when calling: `injectIntl()`'
                );
            });

            it('does not throw when `true` getWrappedInstance() is called', () => {
                const Injected = injectIntl(Wrapped, { withRef: true });
                const instance = new Injected();

                expect(() => instance.getWrappedInstance()).not.toThrow();
            });
        });
    });
});
