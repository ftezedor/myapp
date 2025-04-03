import http, { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import https, { createServer as createHttpsServer, ServerOptions as HttpsServerOptions } from 'https';
import fs from 'fs';
import { LightRequest, LightResponse } from '.';
import { BaseServer, BaseServerOptions, BaseRequest, BaseResponse } from '../base';

type RequestHandler = (req: LightRequest, res: LightResponse) => void | any;

export class LightServer extends BaseServer {
    //private routes: { [key: string]: (req: BaseRequest, res: BaseResponse) => void } = {};
    private routes: { [key: string]: RequestHandler[] } = {};

    private server: http.Server; // | https.Server;

    constructor(options?: BaseServerOptions) {
        super(options);
        if (this.protocol === 'https' && this.httpsCertificateKey && this.httpsCertificate) {
            const httpsOptions: HttpsServerOptions = {
                key: fs.readFileSync(this.httpsCertificateKey),
                cert: fs.readFileSync(this.httpsCertificate)
            };
            this.server = createHttpsServer(httpsOptions, this.requestHandler.bind(this));
        } else {
            this.server = createHttpServer(this.requestHandler.bind(this));
        }
    }

    private getRequestBody(req: IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                resolve(body);
            });

            req.on('error', err => {
                reject(err);
            });
        });
    };

    private async requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const lightReq = new LightRequest(req);
        const lightRes = new LightResponse(res);
        const route = `${req.method} ${lightReq.path}`;
        const routeHandler = this.routes[`${route}`];

        if (req.method === 'PUT' || req.method === 'POST') {
            lightReq.body = await this.getRequestBody(req); // hack job to get the body
        }

        //console.log(`Handling request ${route} ${lightReq.query}`);

        try {
            for (const handler of routeHandler) {
                if (routeHandler) {
                    await handler(lightReq, lightRes);
                } else {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Not Found' }));
                }
            }
        } catch (error) {
            if (!res.headersSent) {
                if (res.statusCode >= 400)
                    res.statusCode = 500;
                res.appendHeader('Content-Type', 'application/json');
                if (error instanceof Error)
                    res.end(JSON.stringify({ error: error.message }));
                else
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        }
    }

    async start(): Promise<this> {

        return new Promise<this>((resolve, reject) => {
            this.server.listen(this.port, this.host, (err?: any) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Light server is running on ${this.protocol}://${this.host}:${this.port}`);
                    resolve(this);
                }
            });
        });
    }

    public enableCors(): void {
        
    }

    //route(method: string, path: string, handler: (req: BaseRequest, res: BaseResponse) => any): void {
    setRoute(method: string, path: string, ...handlers: RequestHandler[]): void {
        if (!['all', 'get', 'post', 'put', 'delete'].includes(method.toLocaleLowerCase())) {
            throw new Error(`Method ${method} is not allowed.`);
        }

        console.log(`Defining route ${path} for ${method}`);

        this.routes[`${method.toUpperCase()} ${path}`] = handlers;
    }
}