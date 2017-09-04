import test from 'ava';

import { build } from '../src/IO';

// const a = require('../../mocks/a.json');
// const b = require('../../mocks/b.json');



test('build', t => {
  build('mocks/prev.json', 'mocks/lang');

  t.is('sd', 'sd');
});