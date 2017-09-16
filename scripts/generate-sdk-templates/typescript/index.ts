import * as shell from 'shelljs';

shell.exec(`tsc -p ${__dirname}/tsconfig.json`);

const srcPath = `${__dirname}/tmp`;
const destPath = `${__dirname}/../../../SDKTemplates/typescript`;

shell.mkdir('-p', destPath);

shell.mv(`${srcPath}/typescript.d.ts`, `${destPath}/typescript.d.ts.tpl`);
shell.mv(`${srcPath}/typescript.js`, `${destPath}/typescript.js.tpl`);

shell.rm('-rf', srcPath);

shell.exec('echo Done.')
