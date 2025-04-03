import { UserEntity } from "../../domain/entities/UserEntity";
import UserController from "../../infrastructure/controllers/UserController";
import { BaseRequest, BaseResponse } from "../../infrastructure/servers/base";
import MockRequest from "../../infrastructure/servers/mock/MockRequest";

type Role = 'admin' | 'user' | 'reader' | 'owner';

export class Authorizer {

    constructor(private readonly roles: Role[]) {

        if (!this.roles || this.roles.length === 0)
            throw new Error("At least one role must be specified.");

        /** 
         * ensures that the authorize method retains the correct context (this) 
         * when it is passed as a standalone function (e.g., to a middleware chain).
         */
        this.validate = this.validate.bind(this); // Bind the method
    }

    public static authorize(...roles: Role[]) {
        return new Authorizer(roles);
    }

    public async validate(req: BaseRequest, res: BaseResponse, next: Function | undefined) {
        try {
            /* retrieve the authenticated user info */
            const loggedUser = await UserController.get_authenticated_user(req);

            /* if owner role was specified, check if the authenticated user is the owner of the user record of interest */
            if (this.roles.includes('owner' as Role)) {
                if (await this.isOwner(req, loggedUser)) {
                    if (next) return next();
                    return;
                }
            }

            if (!this.roles.includes(loggedUser.level as Role)) {
                console.error('Forbidden: User ' + loggedUser.username + ' does not have the required role');
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }

            if (next) return next();
        } catch (error) {
            console.error(error);
            return res.status(403).json({ message: (error as Error).message });
        }
    }

    private async isOwner(req: BaseRequest, loggedUser: UserEntity): Promise<boolean> {
        const userId = req.body?.id || req.query?.id;
        const userName = req.body?.username || req.query?.username;

        if (!userId && !userName) {
            throw new Error('User name or id not found.');
        }

        const mockRequest = MockRequest.create();
        mockRequest.body.id = userId
        mockRequest.body.username = userName
        const targetUser: UserEntity = await UserController.getTargetUser(mockRequest);

        return targetUser.id === loggedUser.id;
    }
}