import Log from "./shared/utils/Log"; Log.setup();
import { BaseServerOptions } from "./infrastructure/servers/base";
import { ExpressServer as AppServer } from "@src/infrastructure/servers/express";
//import { FastifyServer as AppServer } from "@src/infrastructure/servers/fastify";
//import { LightServer as AppServer } from "@src/infrastructure/servers/light";
import config from '@src/config/config';

const server: AppServer = new AppServer(config.server as BaseServerOptions);

server.enableCors();

server.setRoutes('./src/interfaces/routes');

server.start();