/// <reference path="decoratedChai.d.ts"/>

import * as chai from 'chai';
import * as R from 'ramda';

const forEachWithIndex = R.addIndex(R.forEach);

// Decorate chai with the renderAs assertion
chai.use((chai, utils) => {
  var Assertion = chai.Assertion;

  Assertion.addMethod('renderAs', function (this: any, expected: any[], idKey: string) {
    const actual = this._obj;
  
    const flattenExpected = R.flatten(toMultiline(expected.join('\n')));
    const flattenActual = R.flatten(toMultiline(actual));
    const expectedActualPair = R.zip(flattenActual, flattenExpected);

    forEachWithIndex(([expectedLine, actualLine], index) => {
      new Assertion(actualLine, `At Line [${index}]`).to.equal(expectedLine);
    }, expectedActualPair);
  });
});

export const toType = R.curry((
  type: string,
  key: string,
) => {
  return `"${key}": ${type};`
});

export const indent = R.curry((spaces: number, lines: string[]) => {
  const indentation = R.map(() => ' ', R.range(0, spaces)).join('');

  return R.map((line) => {
    // each line might be a set of multiple lines.
    // split them by \n and apply the indentation to all.
    return R.map((split) => indentation + split, line.split('\n')).join('\n');
  }, lines).join('\n');
});

// Recursively splits the string into array when it finds \n
export const toMultiline = (blob: string): any[] => {
  const split = blob.split('\n');

  if (split.length < 2) {
    return split;
  }

  return R.map(toMultiline, split);
}
