import { AnyJSON } from './swift';
export declare const transform: (json: AnyJSON, className: string) => string;
export declare const generate: (json: string, o: {
    namespace: string;
    src?: string | undefined;
}) => string;
