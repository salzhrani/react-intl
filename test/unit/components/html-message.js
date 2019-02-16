import expect from 'expect';
import expectJSX from 'expect-jsx';
import React from 'react';
import Renderer from 'react-test-renderer';
import {getContext} from '../../../src/components/provider';
import FormattedHTMLMessage from '../../../src/components/html-message';

expect.extend(expectJSX);

describe('<FormattedHTMLMessage>', () => {
    let consoleError;
    let renderer;

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error');
        renderer     = Renderer.create;
    });

    afterEach(() => {
        consoleError.mockRestore();
    });

    it('has a `displayName`', () => {
        expect(typeof FormattedHTMLMessage.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedHTMLMessage />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('renders a formatted HTML message in a <span>', () => {
        const intl = getContext();
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>World</b>!',
        };

        const el = <FormattedHTMLMessage {...descriptor} />;

        const comp1 = renderer(el);
        const comp2 = renderer(<span
            dangerouslySetInnerHTML={{
                __html: intl.formatHTMLMessage(descriptor),
            }}
        />);
        // console.log(comp1.toJSON());
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('should not re-render when props and context are the same', () => {
        const rendered = renderer(<FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>World</b>!" />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>World</b>!" />);
        expect(spy).not.toHaveBeenCalled()
    });

    it('should re-render when props change', () => {
        const rendered = renderer(<FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>World</b>!" />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>Galaxy</b>!" />);
        expect(spy).toHaveBeenCalled()
    });

    // it('should re-render when context changes', () => {
    //     intlProvider = new IntlProvider({locale: 'en', defaultLocale: 'en'}, {});
    //     renderer.render(
    //         <FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>World</b>!" />,
    //         intlProvider.getChildContext()
    //     );
    //     const renderedOne = renderer.getRenderOutput();

    //     intlProvider = new IntlProvider({locale: 'en-US', defaultLocale: 'en-US'}, {});
    //     renderer.render(
    //         <FormattedHTMLMessage id="hello" defaultMessage="Hello, <b>World</b>!" />,
    //         intlProvider.getChildContext()
    //     );
    //     const renderedTwo = renderer.getRenderOutput();

    //     expect(renderedOne).toNotBe(renderedTwo);
    // });

    it('accepts `values` prop', () => {
        const intl = getContext({ locale: 'en'});
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>{name}</b>!',
        };
        const values = {name: 'Eric'};

        const comp1 = renderer(<FormattedHTMLMessage {...descriptor} values={values} />);
        const comp2 = renderer(<span
            dangerouslySetInnerHTML={{
                __html: intl.formatHTMLMessage(descriptor, values),
            }}
        />);
        expect(comp1.toJSON()).toEqual(comp2.toJSON());

    });

    it('should re-render when `values` are different', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>{name}</b>!',
        };

        const rendered = renderer(<FormattedHTMLMessage {...descriptor} values={{name: 'Eric'}} />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        
        rendered.update(<FormattedHTMLMessage {...descriptor} values={{name: 'Eric'}} />);
        expect(spy).not.toHaveBeenCalled();

        rendered.update(<FormattedHTMLMessage {...descriptor} values={{name: 'Marissa'}} />);
        expect(spy).toHaveBeenCalled();
    });

    it('should HTML-escape `vlaues`', () => {
    //     const {intl} = intlProvider.getChildContext();
        const intl = getContext();
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>{name}</b>!',
        };
        const values = {name: '<i>Eric</i>'};

        const rendered = renderer(<FormattedHTMLMessage {...descriptor} values={values} />);
        expect(rendered.toJSON().props.dangerouslySetInnerHTML.__html).toEqual('Hello, <b>&lt;i&gt;Eric&lt;/i&gt;</b>!');
        expect(rendered.toJSON()).toEqual(
            renderer(<span
                dangerouslySetInnerHTML={{
                    __html: intl.formatHTMLMessage(descriptor, values),
                }}
            />).toJSON()
        );
    });

    it('accepts `tagName` prop', () => {
        const intl = getContext();
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>World</b>!',
        };


        expect(renderer(<FormattedHTMLMessage {...descriptor} tagName="p" />).toJSON()).toEqual(
            renderer(<p
                dangerouslySetInnerHTML={{
                    __html: intl.formatHTMLMessage(descriptor),
                }}
            />).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const intl = getContext();
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, <b>World</b>!',
        };

        expect(renderer(<FormattedHTMLMessage {...descriptor}>
            {(formattedHTMLMessage) => (
                <i dangerouslySetInnerHTML={{__html: formattedHTMLMessage}} />
            )}
        </FormattedHTMLMessage>).toJSON()).toEqual(
            renderer(<i
                dangerouslySetInnerHTML={{
                    __html: intl.formatHTMLMessage(descriptor),
                }}
            />).toJSON()
        );
    });

    it('does not support rich-text message formatting', () => {

        expect(renderer(<FormattedHTMLMessage
            id="hello"
            defaultMessage="Hello, <b>{name}</b>!"
            values={{
                name: <i>Eric</i>,
            }}
        />).toJSON()).toEqual(
            renderer(<span
                dangerouslySetInnerHTML={{
                    __html: 'Hello, <b>[object Object]</b>!',
                }}
            />).toJSON()
        );
    });
});
