// expressServer.ts
//import express, { Request, Response } from 'express';
import http from 'http';
import https, { ServerOptions } from 'https';
import BaseRequest from './BaseRequest';
import BaseResponse from './BaseResponse';
import fs from 'fs';
import path from 'path';

export type BaseServerOptions = {
    protocol?: 'http' | 'https',
    host?: string,
    port?: number,
    https?: {
        key: string;
        cert: string;
    }
}

export type BaseRequestHandler = (req: BaseRequest, res: BaseResponse, next?: Function) => any;

export default abstract class BaseServer {
    private _protocol: 'http' | 'https' = 'http';
    private _host = 'localhost';
    private _port = 3000;
    private _https_key?: string;
    private _https_cert?: string;

    protected constructor(options?: BaseServerOptions) {
        if (new.target === BaseServer) {
            throw new Error("Cannot instantiate abstract class");
        }

        this._protocol = options?.protocol ?? 'http';
        this._host = options?.host ?? 'localhost';
        this._port = options?.port ?? 3000;
        this._https_key = options?.https?.key;
        this._https_cert = options?.https?.cert;

        if (this._https_key && this._https_cert) {
            this._protocol = 'https';
        }
    }

    get protocol(): 'http' | 'https' {
        return this._protocol;
    }

    private set protocol(value: 'http' | 'https') {
        this._protocol = value;
    }

    /**
     * Get the host name of the server.
     */
    get host(): string {
        return this._host;
    }

    private set host(value: string) {
        this._host = value;
    }

    get port(): number {
        return this._port;
    }

    private set port(value: number) {
        if (value < 1 || value > 65535)
            throw new Error('Port number must be between 1 and 65535.');
        this._port = value;
    }

    get httpsCertificateKey(): string | undefined {
        return this._https_key;
    }
    
    private set httpsCertificateKey(value: string | undefined) {
        this._https_key = value;
    }

    get httpsCertificate(): string | undefined {
        return this._https_cert;
    }

    private set httpsCertificate(value: string | undefined) {
        this._https_cert = value;
    }

    public abstract enableCors(): void;

    //async start(protocol?: 'http' | 'https', host?: string, port?: number): Promise<void> {
    /**
     * Start the application server.
     *
     * @returns A promise that resolves when the server is listening, or rejects if there is an error.
     */
    public abstract start(): Promise<this>;

    public abstract setRoute(method: string, path: string, ...handlers: BaseRequestHandler[]): any;

    /**
     * Recursively scans the specified directory for route modules and sets them up.
     * A valid route module must export a default class that has a method called `define` 
     * that takes a WebServer instance as an argument.
     * @param {string} directoryPath - The path to the directory containing route modules.
     * @returns {void}
     */
    public setRoutes(directoryPath: string): void {
        const files = fs.readdirSync(directoryPath);

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);

            // recurse into subdirectories
            if (fs.statSync(filePath).isDirectory()) {
                this.setRoutes(filePath);
                return;
            } 

            if (file.endsWith('.ts')) {
                const module = require(filePath);

                if (typeof module?.default?.define === 'function') {
                    // Call define() method passing in the WebServer instance
                    module.default.define(this);
                }
            }
        });
    }
}
