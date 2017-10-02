import * as R from 'ramda';

export const toType = R.curry((
  type: string,
  key: string,
) => {
  return `"${key}": ${type};`
});

export const indent = R.curry((spaces: number, lines: string[]) => {
  const indentation = R.map(() => ' ', R.range(0, spaces)).join('');

  return R.map((line) => {
    // each line might be a set of multiple lines.
    // split them by \n and apply the indentation to all.
    return R.map((split) => indentation + split, line.split('\n')).join('\n');
  }, lines).join('\n');
});

// Recursively splits the string into array when it finds \n
export const toMultiline = (blob: string): any[] => {
  const split = blob.split('\n');

  if (split.length < 2) {
    return split;
  }

  return R.map(toMultiline, split);
}

export const fromMultiline = (lines: string[] | string) => {
  if (typeof lines === 'string') {
    return R.flatten(toMultiline(lines));
  }
  // if array of string
  return R.flatten(toMultiline(lines.join('\n')));
}
