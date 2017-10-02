/// <reference types="ramda" />
import * as R from 'ramda';
export declare const toType: R.CurriedFunction2<string, string, string>;
export declare const indent: R.CurriedFunction2<number, string[], string>;
export declare const toMultiline: (blob: string) => any[];
export declare const fromMultiline: (lines: string | string[]) => any[];
