'use strict';

import * as shell from 'shelljs';

const prompt = require('prompt');
// For some Reason is not exposed in shelljs types
const sh: any = shell;
const ShellString: any = sh.ShellString;

// console.log(prompt);

const srcYaml = `
# This is your very first source file.
# If you don\'t know what a YAML file, go to '
#   http://docs.ansible.com/ansible/latest/YAMLSyntax.html for a quick intro;

index:
`

const getBetelgeuseJson = (name: string, cdn: string) => `
{
  "name": "${name}",
  "cdn": "${cdn}",
  "version": "0.0.0"
}
`;

// The API is broader than what I have here, but this should be good fow start
// Look at https://www.npmjs.com/package/prompt for more

type PromptSchemaType = {
  properties: {
    [k: string]: {
      pattern?: string;
      message?: string;
      required?: boolean;
      hidden?: boolean;
      type?: 'string' | 'number' | string;
    }
  }
};

const startPrompt = (question: string | string[] | PromptSchemaType) => {
  prompt.start();

  return new Promise((resolve, reject) => {
    prompt.get(question, (err: string, result: { [k: string]: string }) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result)
    });
  });
}

const escapeShell = (cmd: string) => {
  return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
};

export const bundleInit = (bundleName: string) => {
  console.log(`Initializing ${bundleName}`);

  startPrompt({
    properties: {
      cdn: {
        message: 'Where will the Bundle be hosted (ex. https://my.custom-cdn.com/)',
      }
    }
  })
    .then((r: { cdn: string }) => {
      shell.mkdir('-p', `${bundleName}`);
      shell.mkdir('-p', `${bundleName}/source`);

      ShellString(getBetelgeuseJson(bundleName, r.cdn)).to(`${bundleName}/betelgeuse.json`);
      ShellString(srcYaml).to(`${bundleName}/source/index.yml`);
    })
    .then(() => {
      console.log('Done');
    })
    .catch((e) => {
      console.log('\n');
      console.log(e.message);
    });
}
