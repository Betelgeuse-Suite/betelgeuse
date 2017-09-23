import * as gulp from 'gulp';
import * as Promise from 'bluebird';
import * as insert from 'gulp-insert';
import * as beautify from 'js-beautify';

const jsonToTsd = require('gulp-json-to-tsd');
const intercept = require('gulp-intercept');

const getAppendTemplate = (namespace: string) => `export = ${namespace};`;

type GenerateOptions = {
  namespace: string;
  src: string;
}

export const generate = (o: GenerateOptions) => {
  return new Promise((resolve, reject) => {
    var content = '';

    const res = gulp
      .src(o.src)
      .pipe(jsonToTsd({
        namespace: o.namespace,
      }))
      .pipe(insert.append(getAppendTemplate(o.namespace)))
      .pipe(intercept((file: any) => {
        content = file.contents.toString();

        return file;
      }))
      .on('end', () => {
        resolve(content);
      })
      .on('error', reject);
  })
    .then((r) => <string>r)
    .then(beautify);
}
