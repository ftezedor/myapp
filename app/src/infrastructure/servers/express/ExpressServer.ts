// expressServer.ts
import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import http from 'http';
import https from 'https';
import { BaseServer, BaseServerOptions, BaseRequestHandler } from '@src/infrastructure/servers/base';
import { ExpressRequest, ExpressResponse } from '@src/infrastructure/servers/express';
import fs from 'fs';

const bodyParser = require('body-parser');

export default class ExpressServer extends BaseServer {
    private readonly app: express.Application;

    constructor(options?: BaseServerOptions) {
        super(options);
        this.app = express();
        this.app.use(bodyParser.json());
    }

    // Overriden from WebServer
    async start(): Promise<this> {
        
        const server = this.protocol === 'http'
            ? http.createServer(this.app) 
            : https.createServer({
                key: this.httpsCertificateKey!,
                cert: this.httpsCertificate!
            }, this.app);

        return new Promise((resolve, reject) => {
            server.listen(this.port, this.host, () => {
                console.log(`Express server is running on ${this.protocol}://${this.host}:${this.port}`);
                resolve(this);
            }).on('error', (err: any) => {
                reject(err as Error);
            });
        });

    }

    public enableCors(): void {
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });
    }

    // Overriden from BaseServer
    setRoute(method: string, path: string, ...handlers: BaseRequestHandler[]): void {
        console.log(`Defining route ${path} for ${method}`);
    
        const verb = method.toUpperCase();

        const func = ({
            ALL: this.all,
            GET: this.get,
            POST: this.post,
            PUT: this.put,
            DELETE: this.delete
        })[verb];
    
        if (func) return func.call(this, path, ...handlers);
    
        throw new Error(`Method ${verb} is not allowed.`);
    }

    private getHandlers(...handlers: BaseRequestHandler[]): RequestHandler[] {
        const _handlers: RequestHandler[] = [];

        for (const handler of handlers) {
            _handlers.push((req: Request, res: Response, next: NextFunction) => handler(new ExpressRequest(req), new ExpressResponse(res), next));
        }

        return _handlers;
    }

    private all(path: string, ...handlers: BaseRequestHandler[]): void {
        this.app.all(path, this.getHandlers(...handlers));
    }

    private get(path: string, ...handlers: BaseRequestHandler[]): void {
        this.app.get(path, this.getHandlers(...handlers));
    }

    private post(path: string, ...handlers: BaseRequestHandler[]): void {
        this.app.post(path, this.getHandlers(...handlers));
    }

    private put(path: string, ...handlers: BaseRequestHandler[]): void {
        this.app.put(path, this.getHandlers(...handlers));
    }

    private delete(path: string, ...handlers: BaseRequestHandler[]): void {
        this.app.delete(path, this.getHandlers(...handlers));
    }
}
