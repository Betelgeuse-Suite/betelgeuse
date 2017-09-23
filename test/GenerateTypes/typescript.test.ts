import * as chai from 'chai';
import * as R from 'ramda';
import { generate } from '../../src/GenerateTypes/typescript';
import { toType, indent, toMultiline } from './util';

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
              toString('aString'),
              toString('anEmptyString'),
              toBoolean('aFalseBoolean'),
              toBoolean('aTrueBoolean'),
              toNull('aNull'),
              toNull('anUndefined'),
              toNumber('anIntegerNumber'),
              toNumber('aDecimalNumber'),
              toNumber('aDoubleNumber'),
              toNumber('aFloatNumber'),
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
