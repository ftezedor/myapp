import { BaseResponse } from "@src/infrastructure/servers/base";

export default class MockResponse implements BaseResponse {
    private _headers: { [key: string]: string } = {
        'Content-Type': 'text/plain',
        'Content-Length': '0',
        'Date': new Date().toUTCString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };
    private _body: any;
    private _code: number = 200;

    constructor() { 
    }

    setHeader(name: string, value: string): this {
        this._headers[name] = value;
        return this;

    }
    getHeader(name: string): string | number | string[] | undefined {
        return this._headers[name];
    }

    get headers(): { [key: string]: string } {
        return this._headers;
    }

    send(body: any): void {
        this.setHeader('Content-Type', 'text/plain');
        this.setHeader('Content-Length', body.length);
        this._body = body;
    }

    json(data: any): void {
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Content-Length', String(JSON.stringify(data).length));
        this._body = JSON.stringify(data);
    }

    xml(data: any): void {
        this.setHeader('Content-Type', 'application/xml');
        this.setHeader('Content-Length', String(data.length));
        this._body = data;
    }

    get body(): any {
        return this._body;
    }

    status(code: number): this {
        this._code = code;
        return this;
    }

    get statusCode(): number {
        return this._code;
    }
}