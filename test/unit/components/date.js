// import expect from 'expect';
import expectJSX from 'expect-jsx';
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Renderer from 'react-test-renderer';

Enzyme.configure({ adapter: new Adapter() });
import IntlProvider, {IntlContext} from '../../../src/components/provider';
import FormattedDate from '../../../src/components/date';

expect.extend(expectJSX);


describe('<FormattedDate>', () => {
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
        expect(typeof FormattedDate.displayName).toBe('string');
    });

    // it('throws when <IntlProvider> is missing from ancestry', () => {
    //     expect(() => renderer.render(<FormattedDate />)).toThrow(
    //         '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    //     );
    // });

    it('requires a finite `value` prop', () => {
        // const {intl} = intlProvider.getChildContext();

        renderer(<FormattedDate value={0} />, {});
        expect(isFinite(0)).toBe(true);
        expect(consoleError.mock.calls.length).toBe(0);

        renderer(<FormattedDate />, {});
        console.log(consoleError.mock.calls);
        expect(consoleError.mock.calls.length).toBe(2);
        expect(consoleError.mock.calls[1][0]).toContain(
            '[React Intl] Error formatting date.\nRangeError'
        );
    });

    it('renders a formatted date in a <span>', () => {
        // const {intl} = intlProvider.getChildContext();
        const date = new Date();

        const el = <FormattedDate value={date} />;

        const comp1 = renderer(el);
        const comp2 = renderer(<span><IntlContext.Consumer>{intl => intl.formatDate(date)}</IntlContext.Consumer></span>);
        console.log(comp1.toJSON());
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('should not re-render when props and context are the same', () => {
        const rendered = renderer(<FormattedDate value={0} />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedDate value={0} />);
        expect(spy).not.toHaveBeenCalled()
    });

    it('should re-render when props change', () => {
        const rendered = renderer(<FormattedDate value={0} />);
        const instance = rendered.getInstance()
        const spy = jest.spyOn(instance, 'render')
        rendered.update(<FormattedDate value={1} />);
        expect(spy).toHaveBeenCalled()
    });

    // it('should re-render when context changes', () => {
    //     intlProvider = new IntlProvider({locale: 'en'}, {});
    //     renderer.render(<FormattedDate value={0} />, intlProvider.getChildContext());
    //     const renderedOne = renderer.getRenderOutput();

    //     intlProvider = new IntlProvider({locale: 'en-US'}, {});
    //     renderer.render(<FormattedDate value={0} />, intlProvider.getChildContext());
    //     const renderedTwo = renderer.getRenderOutput();

    //     expect(renderedOne).toNotBe(renderedTwo);
    // });

    it('accepts valid Intl.DateTimeFormat options as props', () => {
        const date = new Date();
        const options = {year: 'numeric'};
        const el = <FormattedDate value={date} {...options} />;

        const comp1 = renderer(el);
        const comp2 = renderer(<span><IntlContext.Consumer>{intl => intl.formatDate(date, options)}</IntlContext.Consumer></span>);

        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('fallsback and warns on invalid Intl.DateTimeFormat options', () => {
        const el = <FormattedDate value={0} year="invalid" />;

        const comp1 = renderer(el);
        const comp2 = renderer(<span>{String(new Date(0))}</span>);
        expect(comp1.toJSON()).toEqual(comp2.toJSON());
        expect(consoleError.mock.calls.length).toBe(2);

    });

    it('accepts `format` prop', () => {
        const date = new Date();
        const format = 'year-only';
        const el = <IntlProvider
                        locale="en" formats={{
                        date: {
                            'year-only': {year: 'numeric'},
                        },
                    }}>
                        <FormattedDate
                            value={date}
                            format={format}/>
                    </IntlProvider>;

        const comp1 = renderer(el);
        const comp2 = renderer(<IntlProvider
            locale="en" formats={{
            date: {
                'year-only': {year: 'numeric'},
            },
        }}><span><IntlContext.Consumer>{intl => intl.formatDate(date, {format})}</IntlContext.Consumer></span></IntlProvider>);

        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });

    it('supports function-as-child pattern', () => {
        const date = new Date();
        const el = <FormattedDate value={date}>{(formattedDate) => (
                        <b>{formattedDate}</b>
                    )}</FormattedDate>;

        const comp1 = renderer(el);
        const comp2 = renderer(<b><IntlContext.Consumer>{intl => intl.formatDate(date)}</IntlContext.Consumer></b>);

        expect(comp1.toJSON()).toEqual(comp2.toJSON());
    });
});
