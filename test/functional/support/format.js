import expect from 'expect';
import expectJSX from 'expect-jsx';
import React from 'react';
import Renderer from 'react-test-renderer';

expect.extend(expectJSX);

export default function (ReactIntl) {
    describe('format', () => {
        const {
            FormattedDate,
            FormattedTime,
            FormattedRelative,
            FormattedNumber,
            FormattedMessage,
        } = ReactIntl;

        let renderer;

        beforeEach(() => {
            renderer     = Renderer.create;
        });

        it('formats dates', () => {
            const date = new Date();
            const el   = <FormattedDate value={date} month="numeric" />;
            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>{date.getMonth() + 1}</span>).toJSON()
            );
        });

        it('formats times', () => {
            const date = new Date();
            const el   = <FormattedTime value={date} />;

            const hours   = date.getHours();
            const minutes = date.getMinutes();

            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>
                    {
                        `${hours > 12 ? (hours % 12) : (hours || '12')}:` +
                        `${minutes < 10 ? `0${minutes}` : minutes} ` +
                        `${hours < 12 ? 'AM' : 'PM'}`
                    }
                </span>).toJSON()
            );
        });

        it('formats dates relative to "now"', () => {
            const now = Date.now();
            const el  = <FormattedRelative value={now - 1000} initialNow={now} />;

            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>1 second ago</span>).toJSON()
            );
        });

        it('formats numbers with thousands separators', () => {
            const el = <FormattedNumber value={1000} />;
            
            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>1,000</span>).toJSON()
            );
        });

        it('formats numbers with decimal separators', () => {
            const el = <FormattedNumber value={0.1} minimumFractionDigits={2} />;

            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>0.10</span>).toJSON()
            );
        });

        it('pluralizes labels in strings', () => {
            const el = (
                <FormattedMessage
                    id="num_emails"
                    defaultMessage="You have {emails, plural, one {# email} other {# emails}}."
                    values={{
                        emails: 1000,
                    }}
                />
            );

            expect(renderer(el).toJSON()).toEqual(
                renderer(<span>You have 1,000 emails.</span>).toJSON()
            );
        });
    });
}
