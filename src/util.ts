import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as beautify from 'js-beautify';
import * as mkdirp from 'mkdirp';

export const readFile = (path: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    })
  })
    // 'hard code' the type
    .then(s => <string>s);
}

export const readJSONFile = 
  (path: string) => Promise.resolve(readFile(path));

export const jsonToObj = <T>(s: string): T => {
  if (typeof s === 'string') {
    return JSON.parse(s);
  }

  throw `${s} is not a Valid JSON!`;
}

export const objToJson = (o: Object): string => {
  return beautify(JSON.stringify(o));
}

export const writeFile = (path: string, content: string) => new Promise((resolve, reject) => {
  fs.writeFile(path, content, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

export type ReadFile = {
  path: string;
  content: string;
}

export const readFiles = (dirname: string, onDone: (...args: any[]) => void, onError: (...args: any[]) => void) => {
  var files: ReadFile[] = [];

  if (dirname && dirname.slice(-1) !== '/') {
    dirname += '/';
  }

  fs.readdir(dirname, (err, filenames) => {
    if (err) {
      onError(err);
      return;
    }

    var pending = filenames.length;

    if (!pending) {
      onDone(files);
      return;
    }

    filenames.forEach((filename) => {
      const path = dirname + filename;

      if (fs.lstatSync(path).isDirectory()) {
        return readFiles(path + '/', (nestedFiles) => {
          files = files.concat(nestedFiles);

          if (!--pending) {
            onDone(files);
          }
        }, onError);
      } else {
        fs.readFile(path, 'utf-8', (err, content) => {
          if (err) {
            onError(err);
            return;
          }

          files.push({ path, content });

          if (!--pending) {
            onDone(files);
          }
        });
      }
    });
  });
}

export const makeDirRecursively = (path: string) => {
  return new Promise((resolve, reject) => {
    mkdirp(path, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * PassThrough takes an argument function fn and returns
 * a thunk that takes an argument a
 *
 * when the thunk is invoked, it invokes the fn() and it returns the
 * argument a.
 *
 * Works pretty well in monadic chains, such as promises,
 * when you need chain a function that creates a side effect!
 */
export const passThrough = <T>(fn: (a: T) => void) => (arg: T) => {
  fn.call(fn, arg);
  return arg;
};

/**
 * Same as PassThrough, except that it waits for fn() to resolve!
 */
export const passThroughAwait = <T>(fn: (a: T) => void) => (arg: T) => {
  return Promise.resolve(fn.call(fn, arg)).then(() => arg);
};

export const now = () => new Date().getTime();
