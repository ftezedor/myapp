import { BaseRequest } from "@src/infrastructure/servers/base";

export default class MockRequest implements BaseRequest {
    constructor(readonly req: Request) {}
    public get clientIp(): string | undefined { return "127.0.0.1"; }
    public get method(): string { return this.req.method; }
    public get url(): string { return this.req.url; }
    public get headers() { return this.req.headers; }
    public get path(): string { return this.req.path; }
    public get query() { return this.req.query; }
    public get body() { return this.req.body; }

    public static create(request?: Request): MockRequest {
        if (!request) {
            request = {
                'method': 'GET',
                'url': 'http://localhost',
                'headers': {'Content-Type': 'application/json', 'Content-Length': '2'},
                'path': '/',
                'query': {},
                'body': {}
            };
        }
        return new MockRequest(request);
    }
}

type Request = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: {[key: string]: string};
    path: string;
    query: {[key: string]: string};
    body: any;
}