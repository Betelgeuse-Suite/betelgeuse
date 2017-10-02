/// <reference path="decoratedChai.d.ts"/>

import * as chai from 'chai';
import * as R from 'ramda';
import { toMultiline, fromMultiline } from '../../src/GenerateTypes/util';

const forEachWithIndex = R.addIndex(R.forEach);

// Decorate chai with the renderAs assertion
chai.use((chai, utils) => {
  var Assertion = chai.Assertion;

  Assertion.addMethod('renderAs', function (this: any, expected: string[] | string, idKey: string) {
    const actual = this._obj;

    const flattenActual = fromMultiline(actual);
    const flattenExpected = fromMultiline(expected);

    forEachWithIndex((expectedLine, i) => {
      const actualLine = flattenActual[i];
      new Assertion(actualLine, `At Line [${i + 1}]`).to.equal(expectedLine);
    }, flattenExpected);

    if (flattenActual.length > flattenExpected.length) {
      const lastCommonLine = flattenExpected.length;
      new Assertion(
        flattenActual.slice(lastCommonLine),
      ).to.equal(flattenExpected.slice(lastCommonLine));
    }
    else if (flattenActual.length < flattenExpected.length) {
      const lastCommonLine = flattenActual.length;
      new Assertion(
        flattenExpected.slice(lastCommonLine),
      ).to.equal(flattenActual.slice(lastCommonLine));
    }
  });
});

export * from '../../src/GenerateTypes/util';