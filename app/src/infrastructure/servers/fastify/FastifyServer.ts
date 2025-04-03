import Fastify, { FastifyInstance, FastifyRequest as Request, FastifyReply as Response, RouteHandler, RouteHandlerMethod, preHandlerHookHandler, preValidationHookHandler } from 'fastify';
import { BaseServer, BaseServerOptions, BaseRequestHandler } from '@src/infrastructure/servers/base';
import { FastifyRequest } from './FastifyRequest';
import { FastifyResponse } from './FastifyResponse';
import fs from 'fs';

export class FastifyServer extends BaseServer {
    protected readonly app: FastifyInstance;

    constructor(options?: BaseServerOptions) {
        super(options);
        this.app = this.initializeServer();
        /*
        if (this.protocol === 'https') {
            this.app = Fastify({
                https: {
                    key: fs.readFileSync(this.httpsCertificateKey!),
                    cert: fs.readFileSync(this.httpsCertificate!)
                }
            });
        } else {
            this.app = Fastify()
        }
        */
    }

    private initializeServer(): FastifyInstance {
        if (this.protocol === 'https') {
            if (!this.httpsCertificateKey || !this.httpsCertificate) {
                throw new Error('HTTPS protocol requires both httpsCertificateKey and httpsCertificate.');
            }
    
            return Fastify({
                https: {
                    key: fs.readFileSync(this.httpsCertificateKey),
                    cert: fs.readFileSync(this.httpsCertificate),
                },
            });
        }
    
        return Fastify();
      }

    async start(): Promise<this> {
          return new Promise((resolve, reject) => {
            this.app.listen({
                host: this.host,
                port: this.port
            }).then(() => {
                console.log(`Fastify server is running on ${this.protocol}://${this.host}:${this.port}`);
                resolve(this);
            }).catch((err: Error) => {
                reject(err);
            })
        });
    }

    public enableCors(): void {
        this.app.register(require('@fastify/cors'), {
            origin: '*',            // Allows requests from any origin
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
            allowedHeaders: '*',    // Allows all headers
            preflightContinue: true, // Ensure preflight requests are handled
            exposedHeaders: ['Authorization'] // Expose specific headers to JavaScript clients
        });
    }

    // Overriden from WebServer
    public setRoute(method: string, path: string, ...handlers: BaseRequestHandler[]): any {
        //console.log(`Defining route ${method} ${path}`);
        console.log(`Defining route ${path} for ${method}`);
        
        if (handlers.length === 0) 
            throw new Error('At least one handler must be provided');

        if (handlers.length > 3) 
            throw new Error('Too many handlers specified (max 3)');
        
        // transform BaseRequestHandler[] to RouteHandler[]
        const routeHandlers: RouteHandler[] = this.transformHandlers(...handlers);

        if (method.toLowerCase() === 'all')
            return this.all(path, ...routeHandlers);
        
        if (method.toLowerCase() === 'get') 
            return this.get(path, ...routeHandlers);
                
        if (method.toLowerCase() === 'post')
            return this.post(path, ...routeHandlers);

        if (method.toLowerCase() === 'put') 
            return this.put(path, ...routeHandlers);
        
        if (method.toLowerCase() === 'delete')
            return this.delete(path, ...routeHandlers);

        throw new Error(`Method ${method} is not allowed.`);
    }

    private transformHandlers(...handlers: BaseRequestHandler[]): RouteHandler[] {
        const _handlers: RouteHandler[] = [];

        for (const handler of handlers) {
            _handlers.push((req: Request, res: Response) => handler(new FastifyRequest(req), new FastifyResponse(res)));
        }

        return _handlers;
    }

    //private all(path: string, ...handlers: BaseRequestHandler[]): void {
    private all(path: string, ...handlers: RouteHandler[]): void {

        this.app.route({
            method: ['GET', 'POST', 'PUT', 'DELETE'],
            url: path,
            preValidation: handlers.at(-3) || this.hollow as preValidationHookHandler,
            preHandler: handlers.at(-2) || this.hollow as preHandlerHookHandler,
            handler: handlers.at(-1) as RouteHandlerMethod
        });

    }

    private get(path: string, ...handlers: RouteHandler[]): void {

        this.app.route({
            method: 'GET',
            url: path,
            preValidation: handlers.at(-3) || this.hollow as preValidationHookHandler,
            preHandler: handlers.at(-2) || this.hollow as preHandlerHookHandler,
            handler: handlers.at(-1) as RouteHandlerMethod
        });

    }

    private post(path: string, ...handlers: RouteHandler[]): void {

        this.app.route({
            method: 'POST',
            url: path,
            preValidation: handlers.at(-3) || this.hollow as preValidationHookHandler,
            preHandler: handlers.at(-2) || this.hollow as preHandlerHookHandler,
            handler: handlers.at(-1) as RouteHandlerMethod
        });

    }

    private put(path: string, ...handlers: RouteHandler[]): void {

        this.app.route({
            method: 'PUT',
            url: path,
            preValidation: handlers.at(-3) || this.hollow as preValidationHookHandler,
            preHandler: handlers.at(-2) || this.hollow as preHandlerHookHandler,
            handler: handlers.at(-1) as RouteHandlerMethod
        });

    }

    private delete(path: string, ...handlers: RouteHandler[]): void {

        this.app.route({
            method: 'DELETE',
            url: path,
            preValidation: handlers.at(-3) || this.hollow as preValidationHookHandler,
            preHandler: handlers.at(-2) || this.hollow as preHandlerHookHandler,
            handler: handlers.at(-1) as RouteHandlerMethod
        });

    }

    /**
     * A placeholder handler function that currently performs no operation.
     * 
     * @param req - The incoming Fastify request object.
     * @param res - The Fastify response object to send replies.
     */
    private async hollow(req: Request, res: Response): Promise<void> {
        return Promise.resolve();
    }
}
