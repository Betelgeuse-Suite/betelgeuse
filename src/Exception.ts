'use strict';

export default class Exception extends Error {
  constructor(msg: string = 'Locale Exception') {
    super(msg);
  }
}

export class NoChangesException extends Exception {
  constructor(msg: string = '') {
    super(`Files are identical! ${msg}`);
  }
}