import UserController from "@src/infrastructure/controllers/UserController";
import { BaseRequest, BaseResponse, BaseServer } from "@src/infrastructure/servers/base";
import { Authenticator } from "@src/shared/utils/Authenticator";
import { stat } from "fs";
import { version } from "os";

export default class AuthRoutes {
    public static async define(server: BaseServer) {
        
        server.setRoute('GET', '/', async (req: BaseRequest, res: BaseResponse) => {
            res.send({ version: '1.23.10', build: '20250402' });
        });

        server.setRoute('GET', '/healthz', async (req: BaseRequest, res: BaseResponse) => {
            res.json({status: 'Alive and kicking'});
        });

        server.setRoute('GET', '/read', async (req: BaseRequest, res: BaseResponse) => {
            res.json({status: 'Open for business'});
        });

        console.log("Routes for system have been defined.");
    }
}