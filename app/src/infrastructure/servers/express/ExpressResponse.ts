// expressResponse.ts
import { Response } from 'express';
import { BaseResponse } from "@src/infrastructure/servers/base";

export default class ExpressResponse implements BaseResponse {
    private res: Response;

    constructor(res: Response) {
        this.res = res;
    }

    setHeader(name: string, value: string): this {
        this.res.setHeader(name, value);
        return this;
    }

    getHeader(name: string): string | number | string[] | undefined {
        return this.res.getHeader(name);
    }

    send(body: any): void {
        if (!this.getHeader('Content-Type'))
            this.setHeader('Content-Type', 'text/plain');
        this.res.send(body);
    }

    json(data: any): void {
        this.setHeader('Content-Type', 'application/json');
        this.send(JSON.stringify(data, null, 3));
    }

    xml(data: any): void {
        this.setHeader('Content-Type', 'application/xml');
        this.send(data);
    }

    status(code: number): this {
        this.res.status(code);
        return this;
    }
}
