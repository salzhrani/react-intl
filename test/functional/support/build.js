import expect from 'expect';
import * as ReactIntl from '../../../src/';

export default function (buildPath) {
    describe('build', () => {
        it('evaluates', () => {
            expect(require(buildPath)).toBeDefined();
        });

        it('has all React Intl exports', () => {
            const ReactIntlBuild = require(buildPath);

            Object.keys(ReactIntl).forEach((name) => {
                expect(typeof ReactIntlBuild[name]).toEqual(typeof ReactIntl[name]);
            });
        });
    });
}
