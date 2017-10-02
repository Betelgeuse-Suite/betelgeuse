import { expect } from 'chai';
import * as R from 'ramda';

import { fromMultiline, indent } from './util';
import { generate } from '../../src/GenerateTypes/swift';


describe('GenerateTypes:Swift', () => {

  describe('Primitives', () => {

    it('works with primitives only', () => {
      const data = {
        "aString": "just a string",
        "anEmptyString": "",
        "aFalseBoolean": false,
        "aTrueBoolean": false,
        "aNull": null,
        "anUndefined": null,
        "anIntegerNumber": 4,
        "aFloatNumber": 0.123123
      };

      const actual = generate(JSON.stringify(data), {
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
          'public let aNull: NSNull',
          'public let anUndefined: NSNull',
          'public let anIntegerNumber: Int',
          'public let aFloatNumber: Float',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.aString = jsonData["aString"] as! String',
            'self.anEmptyString = jsonData["anEmptyString"] as! String',
            'self.aFalseBoolean = jsonData["aFalseBoolean"] as! Bool',
            'self.aTrueBoolean = jsonData["aTrueBoolean"] as! Bool',
            'self.aNull = jsonData["aNull"] as! NSNull',
            'self.anUndefined = jsonData["anUndefined"] as! NSNull',
            'self.anIntegerNumber = jsonData["anIntegerNumber"] as! Int',
            'self.aFloatNumber = jsonData["aFloatNumber"] as! Float',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

  });

  describe('Custom Types', () => {

    it('works with custom objects', () => {
      const data = {
        "record": {
          "aString": "hello",
          "anInt": 24
        },
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let record: Record',
          'class Record {',
          '',
          indent(4)([
            'public let aString: String',
            'public let anInt: Int',
            '',
            'init(_ jsonData: NSDictionary) {',
            indent(4)([
              'self.aString = jsonData["aString"] as! String',
              'self.anInt = jsonData["anInt"] as! Int',
            ]),
            '}',
          ]),
          '}',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.record = Record(jsonData["record"] as! NSDictionary)',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

  });

  describe('Arrays', () => {

    it('finds and uses the correct primitive type among the identically typed items', () => {

      const data = {
        "anArrayOfIdenticalStrings": [
          "I am a string",
          "me too",
          "haha",
        ],
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let anArrayOfIdenticalStrings: [String]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.anArrayOfIdenticalStrings = jsonData["anArrayOfIdenticalStrings"] as! [String]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('finds and uses the Type among identically typed items', () => {

      const data = {
        "anArrayOfIdenticalCustomTypes": [
          {
            "aBoolean": true,
            "aString": "hello"
          },
          {
            "aBoolean": true,
            "aString": "good bye"
          }
        ],
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let anArrayOfIdenticalCustomTypes: [AnArrayOfIdenticalCustomTypes]',
          'class AnArrayOfIdenticalCustomTypes {',
          '',
          indent(4)([
            'public let aBoolean: Bool',
            'public let aString: String',
            '',
            'init(_ jsonData: NSDictionary) {',
            indent(4)([
              'self.aBoolean = jsonData["aBoolean"] as! Bool',
              'self.aString = jsonData["aString"] as! String',
            ]),
            '}',
          ]),
          '}',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.anArrayOfIdenticalCustomTypes = jsonData["anArrayOfIdenticalCustomTypes"] as! [AnArrayOfIdenticalCustomTypes]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('falls back to [Any] when there are multiple types involved', () => {

      const data = {
        "anArrayOfDifferentCustomTypes": [
          {
            "aBoolean": false
          },
          {
            "aString": "hello"
          },
          {
            "aNumber": 23,
            "aString": "good bye"
          }
        ]
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let anArrayOfDifferentCustomTypes: [Any]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.anArrayOfDifferentCustomTypes = jsonData["anArrayOfDifferentCustomTypes"] as! [Any]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with nested arrays', () => {

      const data = {
        "anArrayOfIdenticalCustomTypes": [
          {
            "aBoolean": true,
            "aString": "hello"
          },
          {
            "aBoolean": true,
            "aString": "good bye"
          }
        ],
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let anArrayOfIdenticalCustomTypes: [AnArrayOfIdenticalCustomTypes]',
          'class AnArrayOfIdenticalCustomTypes {',
          '',
          indent(4)([
            'public let aBoolean: Bool',
            'public let aString: String',
            '',
            'init(_ jsonData: NSDictionary) {',
            indent(4)([
              'self.aBoolean = jsonData["aBoolean"] as! Bool',
              'self.aString = jsonData["aString"] as! String',
            ]),
            '}',
          ]),
          '}',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.anArrayOfIdenticalCustomTypes = jsonData["anArrayOfIdenticalCustomTypes"] as! [AnArrayOfIdenticalCustomTypes]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with nested arrays of identical primitives', () => {
      const data = {
        "aNestedArrayOfStrings": [
          [
            [
              "hello",
              "goobye"
            ],
            [
              "ciao",
              "buna",
            ],
            [
              "konichiwa",
              "sayonara"
            ]
          ]
        ]
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let aNestedArrayOfStrings: [[[String]]]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.aNestedArrayOfStrings = jsonData["aNestedArrayOfStrings"] as! [[[String]]]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with nested arrays of different types', () => {
      const data = {
        "anArrayOfArraysOfDifferentCustomTypes": [
          [{ "string": "asd" }],    // [String]
          [{ "aNumber": 879 }],     // [Int]
          [{ "aBoolean": false }],  // [Bool]
        ]                           // [Any]
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let anArrayOfArraysOfDifferentCustomTypes: [Any]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.anArrayOfArraysOfDifferentCustomTypes = jsonData["anArrayOfArraysOfDifferentCustomTypes"] as! [Any]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with nested arrays of identical primitives of different lengths', () => {
      const data = {
        "aNestedArrayOfStrings": [
          [
            ["hello", "goobye"],
            ["ciao", "buna", "sarutmana", "hehe"],
            ["konichiwa"],
          ]
        ]
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let aNestedArrayOfStrings: [[[String]]]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.aNestedArrayOfStrings = jsonData["aNestedArrayOfStrings"] as! [[[String]]]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with nested arrays of identical primitives of different lengths grouped individually', () => {
      const data = {
        "aNestedArrayOfStrings": [
          [[["hello"], ["goobye"]]],
          [[["ciao"], ["buna"], ["sarutmana"], ["hehe"]]],
          [[["konichiwa"]]]
        ]
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let aNestedArrayOfStrings: [[[[String]]]]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.aNestedArrayOfStrings = jsonData["aNestedArrayOfStrings"] as! [[[[String]]]]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

    it('works with arrays of nested custom types already defined/used outside of the array', () => {

      const data = {
        "record": {
          "aString": "hello",
          "anInt": 24
        },
        "anArrayOfRecords": [
          {
            "aString": "ceau",
            "anInt": 29
          },
          {
            "aString": "bye",
            "anInt": 30
          }
        ],
      }

      const actual = generate(JSON.stringify(data), {
        namespace: 'TestSwift',
      });

      const expected = [
        'import Foundation',
        '',
        'class TestSwift {',
        '',
        indent(4)([
          'public let record: Record',
          'class Record {',
          '',
          indent(4)([
            'public let aString: String',
            'public let anInt: Int',
            '',
            'init(_ jsonData: NSDictionary) {',
            indent(4)([
              'self.aString = jsonData["aString"] as! String',
              'self.anInt = jsonData["anInt"] as! Int',
            ]),
            '}',
          ]),
          '}',
          'public let anArrayOfRecords: [Record]',
          '',
          'init(_ jsonData: NSDictionary) {',
          indent(4)([
            'self.record = Record(jsonData["record"] as! NSDictionary)',
            'self.anArrayOfRecords = jsonData["anArrayOfRecords"] as! [Record]',
          ]),
          '}',
        ]),
        '}',
      ];

      expect(actual).to.renderAs(expected);
    });

  });
});