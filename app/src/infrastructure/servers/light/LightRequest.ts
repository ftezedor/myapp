import { IncomingMessage } from 'http';
import { BaseRequest } from '../base'
import * as url from 'url';

export class LightRequest implements BaseRequest {
    private _path: string;
    private _query: { [key: string]: string };
    protected _body: undefined | string;

    constructor(private req: IncomingMessage) {
        const { pathname, query } = url.parse(this.req.url || '', true);

        this._path = pathname || '';
        this._query = JSON.parse(JSON.stringify(query));
/* 
        let buf: Buffer[] = [];
        req.on('data', (chunk) => {
            console.log('LightRequest data');
            buf.push(chunk);
            console.log('LightRequest data');
        }).on('end', () => {
            console.log('LightRequest end');
            this._body = buf.join('').toString();
            console.log('LightRequest end');
        }); 
*/
    }
    get clientIp(): string | undefined {
        return this.headers['x-forwarded-for'] || this.req.socket.remoteAddress || undefined;
    }

    get method(): string {
        return this.req.method || '';
    }

    get url(): string {
        return this.req.url || '';
    }

    get headers(): { [key: string]: string } {
        return this.req.headers as { [key: string]: string };
    }

    get path(): string {
        return this._path;
    }

    get query(): { [key: string]: string } {
        return this._query;
    }

    get body(): any {
/*         while (!this._body) {
            this.req.read();
        } */

        try {
            // You might need to handle body parsing here
            if (this.headers['content-type'] === 'application/json') {
                return this._body ? JSON.parse(this._body) : {};
            } else { 
                return this._body || '';
            }
        } catch (e) {
            console.error('LightRequest error: ', e);
            return {};
        }
    }

    set body(value: any) {
        this._body = value;
    }
}
