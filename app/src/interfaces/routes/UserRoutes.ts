import { BaseServer, BaseRequest, BaseResponse } from "@src/infrastructure/servers/base";
import UserController from "@src/infrastructure/controllers/UserController";
import { Authenticator as Auth } from "@src/shared/utils/Authenticator";
import { Authorizer } from "@src/application/services/Authorizer";
import validatePassword from "@src/shared/utils/Password";

class Password { 
    public static enforce(req: BaseRequest, res: BaseResponse, next?: Function) {
        if (req.body.password) {
            validatePassword(req.body.password);
        }
        if (next) return next();
    }
}

export default class UserRoutes {
    public static async define(server: BaseServer) {

        // Define routes for users api version 1

        let authzr = Authorizer.authorize('admin');
        server.setRoute('GET', '/api/v1/users', Auth.authenticate, authzr.validate, UserController.getUsers);
        server.setRoute('POST', '/api/v1/user', Auth.authenticate, authzr.validate, UserController.createUser);
        server.setRoute('DELETE', '/api/v1/user', Auth.authenticate, authzr.validate, UserController.deleteUser);

        authzr = Authorizer.authorize('admin', 'owner');
        server.setRoute('GET', '/api/v1/user', Auth.authenticate, authzr.validate, UserController.getUser);
        server.setRoute('PUT', '/api/v1/user', Auth.authenticate, authzr.validate, UserController.updateUser);

        console.log("Routes for users api have been defined.");
    }
}