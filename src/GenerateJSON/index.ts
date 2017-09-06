import * as yaml from 'yamljs';
import * as R from 'ramda';
import * as Promise from 'bluebird';
import * as  clc from 'cli-color';

import { readFiles, ReadFile, objToJson } from '../util';


const insertPathInto = (path: string, parent: any, leafValue: any): { path: string } => {
  const dirs = path.split('/');
  const key = dirs[0];

  if (dirs.length > 1) {
    parent[key] = parent[key] || {};
    return insertPathInto(path.slice(path.indexOf('/') + 1), parent[key], leafValue);
  } else {
    parent[key] = leafValue;
    return parent;
  }
};

const concatObjects: (fs: ReadFile[]) => { [i: string]: any } =
  R.reduce((result, file: ReadFile) => {
    insertPathInto(file.path, result, file.content);

    return result;
  }, {});

const stripFileExtension = (file: ReadFile): ReadFile => {
  return R.set(
    R.lensProp('path'),
    file.path.slice(0, file.path.lastIndexOf('.')),
    file,
  );
}
const stripRoot = R.curry((rootPath: string, file: ReadFile): ReadFile => {
  return R.set(
    R.lensProp('path'),
    file.path.slice(rootPath.length),
    file,
  );
});

const isYamlFile = (f: ReadFile) => {
  const ext = f.path.slice(f.path.lastIndexOf('.') + 1);
  return ext === 'yaml' || ext === 'yml';
};
const onlyYAML: (f: ReadFile[]) => ReadFile[] =
  R.filter((f) => isYamlFile(f));


export const generateJSONFromYamlFiles = (atPath: string) => new Promise((resolve, reject) => {
  console.log('Generating JSON Files from Yaml at', atPath);

  readFiles(atPath, (files) => {
    const result = concatObjects(R.map((f) => {
      try {
        var parsed = yaml.parse(f.content);
      } catch (e) {
        console.log(clc.red('YAML Error:', e.message, 'at line', e.parsedLine));
        console.log(clc.white('      File: ' + f.path));
        throw 'End Error';
      }

      return R.merge(f, {
        content: parsed,
        path: R.pipe(
          stripFileExtension,
          stripRoot(atPath),
        )(f).path
      });

    }, onlyYAML(files)));

    resolve(result);
  }, (e) => {
    console.log(clc.red('Read File Error:', e.message));
    reject(e);
  })
})
  .then(objToJson);
