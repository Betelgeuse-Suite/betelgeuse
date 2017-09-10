'use strict';

export class Exception extends Error {
  constructor(msg: string = 'Locale Exception') {
    super(msg);
  }
}

export class NoChangesException extends Exception {
  constructor(msg: string = '') {
    super(`There are no changes! ${msg}`);
  }
}