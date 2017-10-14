/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare const generate: (o: {
    namespace: string;
    src: string;
}) => Promise<string>;
