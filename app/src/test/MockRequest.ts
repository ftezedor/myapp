import { BaseRequest } from "@src/infrastructure/servers/base";

export default class MockRequest implements BaseRequest {
    constructor(readonly req: Request) {}
    public get method(): string { return this.req.method; }
    public get url(): string { return this.req.url; }
    public get headers() { return this.req.headers; }
    public get path(): string { return this.req.path; }
    public get query() { return this.req.query; }
    public get body() { return this.req.body; }
}

type Request = {
    method: string;
    url: string;
    headers: {[key: string]: string};
    path: string;
    query: {[key: string]: string};
    body: any;
}