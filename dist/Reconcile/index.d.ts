/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare const reconcile: (prevJson: string, currentJson: string) => Promise<string>;
