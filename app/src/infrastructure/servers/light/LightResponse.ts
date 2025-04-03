import { ServerResponse } from 'http';
import { BaseResponse } from '../base'

export class LightResponse implements BaseResponse {
    constructor(private res: ServerResponse) {}

    setHeader(name: string, value: string): this {
        this.res.setHeader(name, value);
        return this;
    }

    getHeader(name: string): string | number | string[] | undefined {
        return this.res.getHeader(name);
    }

    send(body: any): void {
        this.setHeader('Content-Type', 'text/plain');
        this.res.end(body);
    }

    json(data: any): void {
        this.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(data));
    }

    xml(data: any): void {
        this.setHeader('Content-Type', 'application/xml');
        this.res.end(data);
    }

    status(code: number): this {
        this.res.statusCode = code;
        return this;
    }

//    get sent(): boolean {
//        return this.res.headersSent
//    }
}
