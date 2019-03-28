import React from 'react';
import Renderer from 'react-test-renderer';
import {Consumer} from '../../../src/context';
import FormattedMessage from '../../../src/components/message';


describe('<FormattedMessage>', () => {
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
        expect(typeof FormattedMessage.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry and there is no defaultMessage', () => {
    //     expect(() => renderer.render(<FormattedMessage />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('should work if <IntlProvider> is missing from ancestry but there is defaultMessage', () => {
        const comp1 = renderer(<FormattedMessage id="hello" defaultMessage="Hello" />);
        const comp2 = renderer(<span>Hello</span>);
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
        // expect(consoleError.mock.calls.length).toBe(2);
    });

    it('renders a formatted message in a <span>', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, World!',
        };
        const comp1 = renderer(<FormattedMessage {...descriptor} />);
        const comp2 = renderer(<Consumer>{intl => <span>{intl.formatMessage(descriptor)}</span>}</Consumer>);
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('should not cause a unique "key" prop warning', () => {

        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, {name}!',
        };
        renderer(<FormattedMessage {...descriptor} values={{name: <b>Eric</b>}} />);
        expect(consoleError.mock.calls.length).toBe(0);
    });

    it('should not cause a prop warning when description is a string', () => {
        const descriptor = {
            id: 'hello',
            description: 'Greeting',
            defaultMessage: 'Hello, {name}!',
        };

        renderer(<FormattedMessage {...descriptor} values={{name: <b>Eric</b>}} />);
        expect(consoleError.mock.calls.length).toBe(0);
    });

    it('should not cause a prop warning when description is an object', () => {
        const descriptor = {
            id: 'hello',
            description: {
                text: 'Greeting',
                ticket: 'GTP-1234',
            },
            defaultMessage: 'Hello, {name}!',
        };

        renderer(<FormattedMessage {...descriptor} values={{name: <b>Eric</b>}} />);
        expect(consoleError.mock.calls.length).toBe(0);
    });

    it('should not re-render when props and context are the same', () => {
        const rendered = renderer(<FormattedMessage id="hello" defaultMessage="Hello, World!" />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedMessage id="hello" defaultMessage="Hello, World!" />);
        expect(spy).not.toHaveBeenCalled()
    });

    it('should re-render when props change', () => {
        const rendered = renderer(<FormattedMessage id="hello" defaultMessage="Hello, World!" />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedMessage id="hello" defaultMessage="Hello, Galaxy!" />,);
        expect(spy).toHaveBeenCalled()
    });

    // it('should re-render when context changes', () => {
    //     intlProvider = new IntlProvider({locale: 'en', defaultLocale: 'en'}, {});
    //     renderer.render(
    //         <FormattedMessage id="hello" defaultMessage="Hello, World!" />,
    //         intlProvider.getChildContext()
    //     );
    //     const renderedOne = renderer.getRenderOutput();

    //     intlProvider = new IntlProvider({locale: 'en-US', defaultLocale: 'en-US'}, {});
    //     renderer.render(
    //         <FormattedMessage id="hello" defaultMessage="Hello, World!" />,
    //         intlProvider.getChildContext()
    //     );
    //     const renderedTwo = renderer.getRenderOutput();

    //     expect(renderedOne).toNotBe(renderedTwo);
    // });

    it('accepts `values` prop', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, {name}!',
        };
        const values = {name: 'Eric'};
        const comp1 = renderer(<FormattedMessage {...descriptor} values={values} />);
        const comp2 = renderer(<Consumer>{intl => <span>{intl.formatMessage(descriptor, values)}</span>}</Consumer>);
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('should re-render when `values` are different', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, {name}!',
        };

        const rendered = renderer(<FormattedMessage {...descriptor} values={{name: 'Eric'}} />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        
        rendered.update(<FormattedMessage {...descriptor} values={{name: 'Eric'}} />);
        expect(spy).not.toHaveBeenCalled();

        rendered.update(<FormattedMessage {...descriptor} values={{name: 'Marissa'}} />);
        expect(spy).toHaveBeenCalled();
    });

    it('accepts string as `tagName` prop', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, World!',
        };

        const rendered = renderer(<FormattedMessage {...descriptor} tagName="p" />);
        expect(rendered.toJSON()).toEqual(
            renderer(<Consumer>{intl => <p>{intl.formatMessage(descriptor)}</p>}</Consumer>).toJSON()
        );
    });

    it('accepts an react element as `tagName` prop', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, World!',
        };

        const H1 = ({children}) => <h1>{children}</h1>
        const rendered = renderer(<FormattedMessage {...descriptor} tagName={H1} />);
        expect(rendered.toJSON()).toEqual(
            renderer(<Consumer>{intl => <H1>{intl.formatMessage(descriptor)}</H1>}</Consumer>).toJSON()
        );
    });

    it('supports function-as-child pattern', () => {
        const descriptor = {
            id: 'hello',
            defaultMessage: 'Hello, World!',
        };

        const rendered = renderer(<FormattedMessage {...descriptor}>
            {(formattedMessage) => (
                <b>{formattedMessage}</b>
            )}
        </FormattedMessage>);
        expect(rendered.toJSON()).toEqual(
            renderer(<Consumer>{intl => <b>{intl.formatMessage(descriptor)}</b>}</Consumer>).toJSON()
        );
    });

    it('supports rich-text message formatting', () => {

        const rendered = renderer(<FormattedMessage
            id="hello"
            defaultMessage="Hello, {name}!"
            values={{
                name: <b>Eric</b>,
            }}
        />);
        expect(rendered.toJSON()).toEqual(
            renderer(<span>Hello, <b>Eric</b>!</span>).toJSON()
        );

        expect(Array.isArray(rendered.toJSON().children)).toBe(true);
    });

    it('supports rich-text message formatting in function-as-child pattern', () => {
        const rendered = renderer(<FormattedMessage
            id="hello"
            defaultMessage="Hello, {name}!"
            values={{
                name: <b>Prem</b>,
            }}
        >
            {(...formattedMessage) => (
                <strong>{formattedMessage}</strong>
            )}

        </FormattedMessage>);
        expect(rendered.toJSON()).toEqual(
            renderer(<strong>Hello, <b>Prem</b>!</strong>).toJSON()
        );
        expect(Array.isArray(rendered.toJSON().children)).toBe(true);
    });
});
