import * as shell from 'shelljs';

shell.exec(`tsc -p ${__dirname}/tsconfig.json`);
