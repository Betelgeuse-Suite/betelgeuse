import { expect } from 'chai';
import { fromMultiline } from './util';
import * as R from 'ramda';

import { generate } from '../../src/GenerateTypes/swift';
import { indent } from './util';

const primitivesJson = require('./data.primitives.mock.json');

// Redefine it here, in case the src/toType breaks, this will catch it
const toTypeDeclaration = R.curry((
  type: string,
  key: string,
) => {
  return `public let ${key}: ${type}`;
});

const toBoolDeclaration = toTypeDeclaration('Bool');
const toStringDeclaration = toTypeDeclaration('String');
const toIntDeclaration = toTypeDeclaration('Int');
const toVoidDeclaration = toTypeDeclaration('Void');

const toAsignment = R.curry((
  type: string,
  key: string,
) => {
  return `self.${key} = jsonData[\"${key}\"] as! ${type}`
});

const toBoolAsignment = toAsignment('Bool');
const toStringAsignment = toAsignment('String');
const toIntAsignment = toAsignment('Int');
const toVoidAsignment = toAsignment('Void');


describe('GenerateTypes:Swift', () => {

  it('works', () => {
    const actual = generate(JSON.stringify(primitivesJson), {
      namespace: 'TestSwift',
    });
    
    const expected = [
      'import Foundation',
      '',
      'class TestSwift {',
      '',
      indent(4)([
        'public let aString: String',
        'public let anEmptyString: String',
        'public let aFalseBoolean: Bool',
        'public let aTrueBoolean: Bool',
        'public let aNull: Void',
        'public let anUndefined: Void',
        'public let anIntegerNumber: Int',
        'public let aDecimalNumber: Int',
        'public let aDoubleNumber: Int',
        'public let aFloatNumber: Int',
        '',
        'init(jsonData: NSDictionary) {',
        indent(4)([
          'self.aString = jsonData["aString"] as! String',
          'self.anEmptyString = jsonData["anEmptyString"] as! String',
          'self.aFalseBoolean = jsonData["aFalseBoolean"] as! Bool',
          'self.aTrueBoolean = jsonData["aTrueBoolean"] as! Bool',
          'self.aNull = jsonData["aNull"] as! Void',
          'self.anUndefined = jsonData["anUndefined"] as! Void',
          'self.anIntegerNumber = jsonData["anIntegerNumber"] as! Int',
          'self.aDecimalNumber = jsonData["aDecimalNumber"] as! Int',
          'self.aDoubleNumber = jsonData["aDoubleNumber"] as! Int',
          'self.aFloatNumber = jsonData["aFloatNumber"] as! Int',
        ]),
        '}',
      ]),
      '}',
    ];

    expect(actual).to.renderAs(expected);
  });

});