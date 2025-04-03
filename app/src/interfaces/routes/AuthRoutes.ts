import UserController from "@src/infrastructure/controllers/UserController";
import { BaseRequest, BaseResponse, BaseServer } from "@src/infrastructure/servers/base";
import { Authenticator } from "@src/shared/utils/Authenticator";

export default class AuthRoutes {
    public static async define(server: BaseServer) {
        
        server.setRoute('POST', '/auth/login', UserController.login);

        server.setRoute('GET', '/auth/renew', Authenticator.authenticate, async (req: BaseRequest, res: BaseResponse) => {
            await UserController.refreshToken(req, res);
            res.json({message: 'Token renewed!'});
        });

        console.log("Routes for auth api have been defined.");
    }
}