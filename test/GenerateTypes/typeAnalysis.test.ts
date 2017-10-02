import { expect } from 'chai';

import { hashObject } from '../../src/GenerateTypes/swift/typeAnalysis';

describe('GenerateTypes:Swift TypeAnalysis', () => {

  describe('Two objects are considered identical as long their belonging keys are of same LENGTH, TYPE and NAME (not order or value)', () => {

    it('works with keys in the same orer', () => {

      const objectA = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      const objectB = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      expect(hashObject(objectA, {})).to.equal(hashObject(objectB, {}));
    });

    it('works with keys in the same in different order', () => {

      const objectA = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      const objectB = {
        "anUndefined": null,
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aString": "just a string",
        "aTrueBoolean": false,
        "aFloatNumber": 0.123123,
        "aNull": null,
        "anIntegerNumber": 4
      }

      expect(hashObject(objectA, {})).to.equal(hashObject(objectB, {}));
    });

    it('does NOT work with keys of different LENGTHS', () => {

      const objectA = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
      }

      const objectB = {
        "anUndefined": null,
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aString": "just a string",
        "aTrueBoolean": false,
        "aFloatNumber": 0.123123,
        "aNull": null,
        "anIntegerNumber": 4
      }

      expect(hashObject(objectA, {})).to.not.equal(hashObject(objectB, {}));
    });

    it('does NOT work with keys of different NAMES', () => {

      const objectA = {
        "aString": "just a string",

        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      const objectB = {
        "anotherString": "just a string",

        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      expect(hashObject(objectA, {})).to.not.equal(hashObject(objectB, {}));
    });

    it('does NOT work with keys of different TYPES', () => {

      const objectA = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      }

      const objectB = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4.0897, // different than 4
        "aFloatNumber": 0.123123
      }

      expect(hashObject(objectA, {})).to.not.equal(hashObject(objectB, {}));
    });

  });

});
