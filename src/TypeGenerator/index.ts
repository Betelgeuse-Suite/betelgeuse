// This file is just an interface between js and the cli, where
// each differe generator will run.

// import { exec } from 'child_process';

import { generate as generateTSD } from './tsd.generator';

Promise.all([
  generateTSD({
    src: './mocks/b.json',
    out: './mocks/tt.d.ts',
    namespace: 'Beetlejuice',
  })
  .then((content) => {
    console.log('TSD:', content);
  }),
])
.catch((e) => {
  console.error('TypeGenerator Error', e);
});


  
