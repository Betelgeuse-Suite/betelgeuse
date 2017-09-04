import test from 'ava';

import { buildNextVersion } from '../src/IO';

// const a = require('../../mocks/a.json');
// const b = require('../../mocks/b.json');



test('build', t => {
  buildNextVersion('mocks/a.json', 'mocks/lang');

  t.is('sd', 'sd');
});