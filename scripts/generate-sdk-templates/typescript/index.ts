import * as shell from 'shelljs';

shell.exec(`tsc -p ${__dirname}/tsconfig.json`);

shell.exec(`mv ${__dirname}/out/typescript.d.ts ${__dirname}/../../../SDKTemplates/typescript/typescript.d.ts.tpl`);
shell.exec(`mv ${__dirname}/out/typescript.js ${__dirname}/../../../SDKTemplates/typescript/typescript.js.tpl`);

shell.exec('echo Done.')
