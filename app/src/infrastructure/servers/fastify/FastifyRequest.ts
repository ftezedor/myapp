import { FastifyRequest as Request } from 'fastify';
import { BaseRequest } from '../base';

export class FastifyRequest implements BaseRequest {
    private req: Request;

    constructor(request: Request) {
        this.req = request;
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

    getHeader(name: string): string | undefined {
        return this.req.headers[name.toLowerCase()] as string | undefined;
    }

    get headers(): { [key: string]: string } {
        return this.req.headers as { [key: string]: string };
    }

    get path(): string {
        return this.req.url;
    }

    get query(): { [key: string]: string } {
        return this.req.query as { [key: string]: string };
    }

    get body(): any {
        return this.req.body;
    }
}
