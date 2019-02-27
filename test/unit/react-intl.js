import * as ReactIntl from '../../src/react-intl';

describe('react-intl', () => {
    describe('exports', () => {
        it('exports `addLocaleData`', () => {
            expect(typeof ReactIntl.addLocaleData).toBe('function');
        });

        it('exports `defineMessages`', () => {
            expect(typeof ReactIntl.defineMessages).toBe('function');
        });

        it('exports `injectIntl`', () => {
            expect(typeof ReactIntl.injectIntl).toBe('function');
        });

        describe('React Components', () => {
            it('exports `IntlProvider`', () => {
                expect(typeof ReactIntl.IntlProvider).toBe('function');
            });

            it('exports `FormattedDate`', () => {
                expect(typeof ReactIntl.FormattedDate).toBe('function');
            });

            it('exports `FormattedTime`', () => {
                expect(typeof ReactIntl.FormattedTime).toBe('object');
            });

            it('exports `FormattedRelative`', () => {
                expect(typeof ReactIntl.FormattedRelative).toBe('object');
            });

            it('exports `FormattedNumber`', () => {
                expect(typeof ReactIntl.FormattedNumber).toBe('object');
            });

            it('exports `FormattedPlural`', () => {
                expect(typeof ReactIntl.FormattedPlural).toBe('object');
            });

            it('exports `FormattedMessage`', () => {
                expect(typeof ReactIntl.FormattedMessage).toBe('function');
            });

            it('exports `FormattedHTMLMessage`', () => {
                expect(typeof ReactIntl.FormattedHTMLMessage).toBe('function');
            });
        });

        describe('PropTypes Definitions', () => {
            it('exports `intlShape`', () => {
                expect(typeof ReactIntl.intlShape).toBe('function');
            });
        });
    });
});
