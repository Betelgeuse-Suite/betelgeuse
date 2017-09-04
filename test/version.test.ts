import test from 'ava';

import { 
    getReleaseType as version,
} from '../src/Version';

test('detects no changes', t => {
  t.is(version({}, {}), 'none');
  t.is(version({a: 4}, {a: 4}), 'none');
  t.is(version(
      {a: 4, nes: {ted: {val: 'a'}}},
      {a: 4, nes: {ted: {val: 'a'}}}
  ), 'none');
});

test('detects patch changes', t => {
  t.is(version(
      {a: 'asd'},
      {a: 'asds'}
  ), 'patch');

  t.is(version(
      {a: 'asd', b: '4fa'},
      {a: 'asds', b: 'roigh'}
  ), 'patch');

  t.is(version(
      {a: 'asd', nes: {ted: {val: 3}}},
      {a: 'asd', nes: {ted: {val: 2}}}
  ), 'patch');
});

test('patch takes priority over none', t => {
  t.is(version(
      {a: 'asd'},
      {a: 'asd'},
  ), 'none');

  t.is(version(
      {a: 'asd'},
      {a: 'asd has changed'},
  ), 'patch');
});

test('detects minor changes', t => {
  t.is(version(
      {a: 'asd'},
      {a: 'asd', b: 'wed'}
  ), 'minor');

  t.is(version(
      {a: 'asd', b: 'wed'},
      {a: 'asd', b: 'wed', c: 'qwe'}
  ), 'minor');

  t.is(version(
      {a: 'asd', nes: {ted: {val: 'a'}}},
      {a: 'asd', nes: {ted: {val: 'a'}, next_ted: {val: 'b'}}}
  ), 'minor');
});

test('minor takes priority over patch', t => {
  t.is(version(
      {a: 'asd'},
      {a: 'asd has changed'},
  ), 'patch');


  t.is(version(
      {a: 'asd'},
      {a: 'asd has changed', b: 'but b is new'},
  ), 'minor');
});

test('detects major changes', t => {
  t.is(version(
      {a: 'asd'},
      {b: 'asd'}
  ), 'major');

  t.is(version(
      {a: 'asd'},
      {b: 'asd', c: 'oih'}
  ), 'major');

  t.is(version(
      {a: 'asd', nes: {ted: {val: 'a'}}},
      {a: 'asd', nes: {ted: {value: 'a'}}}
  ), 'major');

  t.is(version(
      {a: 'asd', nes: {ted: {val: 'a'}}},
      {b: 'asd', c: 'oih'}
  ), 'major');
});

test('major takes priority over minor', t => {
  t.is(version(
      {a: 'asd'},
      {a: 'asd has changed', b: 'but b is new'},
  ), 'minor');

  t.is(version(
      {a: 'asd'},
      {c: 'asd has changed to another prop', b: 'but b is new'},
  ), 'major');
});
