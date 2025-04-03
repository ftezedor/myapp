// expressRequest.ts
import { Request } from 'express';
import { BaseRequest } from "@src/infrastructure/servers/base";

export default class ExpressRequest implements BaseRequest {
    private req: Request;

    constructor(req: Request) {
        this.req = req;
    }
    get clientIp(): string | undefined {
        return this.req.ip || this.req.socket.remoteAddress || undefined;
    }

    get method(): string {
        return this.req.method;
    }

    get url(): string {
        return this.req.url;
    }

/*     getHeader(name: string): string | undefined {
        return this.req.headers[name.toLowerCase()] as string | undefined;
    }
 */
    get headers(): { [key: string]: string } {
        return this.req.headers as { [key: string]: string };
    }

    get path(): string {
        return this.req.path;
    }

    get query(): { [key: string]: string } {
        return this.req.query as { [key: string]: string };
    }

    get body(): any {
        return this.req.body;
    }
}
