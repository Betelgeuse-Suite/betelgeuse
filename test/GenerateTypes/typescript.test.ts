import * as chai from 'chai';
import * as R from 'ramda';
import { generate } from '../../src/GenerateTypes/typescript';
import { indent } from './util';

// Redefine it here, in case the src/toType breaks, this will catch it
export const toType = R.curry((
  type: string,
  key: string,
) => {
  return `"${key}": ${type};`
});

const toBoolean = toType('boolean');
const toString = toType('string');
const toNumber = toType('number');
const toNull = toType('null | undefined');
const toUndefined = toNull;


describe('GenerateTypes:Typescript', () => {

  it('works with primitives', () => {
    return generate({
      src: __dirname + '/data.primitives.mock.json',
      namespace: 'TestMockData',
    }).
      then((tsd) => {
        const expected = [
          'declare namespace TestMockData {',
          indent(4)([
            'interface DataPrimitivesMock {',
            indent(4)([
              '"aString": string;',
              '"anEmptyString": string;',
              '"aFalseBoolean": boolean;',
              '"aTrueBoolean": boolean;',
              '"aNull": null | undefined;',
              '"anUndefined": null | undefined;',
              '"anIntegerNumber": number;',
              '"aDecimalNumber": number;',
              '"aDoubleNumber": number;',
              '"aFloatNumber": number;',
            ]),
            '}',
          ]),
          '}',
          'export = TestMockData;'
        ];

        chai.expect(tsd).to.renderAs(expected);
      });

  });
});
