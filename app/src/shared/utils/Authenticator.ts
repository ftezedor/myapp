import { BaseRequest, BaseResponse } from "@src/infrastructure/servers/base";
import { TokenService } from "@src/infrastructure/security/TokenService";
import config from "@src/config/config";
import UserController from "@src/infrastructure/controllers/UserController";
import MockRequest from "@src/infrastructure/servers/mock/MockRequest";
import { UserEntity } from "@src/domain/entities/UserEntity";

function getTokenInfo(token: string) { 
    return TokenService.secret(config.secrets.encKey).unwrap(token).then(data => data); 
}

export class Authenticator {

    public static async authenticate(req: BaseRequest, res: BaseResponse, next?: Function) {

        //console.log('Auth.authenticate() at ' + new Date().toISOString());

        const authHeader = req.headers['authorization'];
        
        if (!authHeader?.split(' ')[1])
            return res.status(401).json({ message: 'Unauthorized: Missing token' });

        const token = authHeader.split(' ')[1];   // Bearer <token>

        await TokenService.secret(config.secrets.encKey).validate(token).then(ok => {
            if (!ok) throw new Error('Invalid or expired token');
            if (next) return next();
        }).catch(error => {
            console.error(error);
            //res.status(401);
            return res.status(401).json({ error: error.message, message: 'Unauthorized' });
            //throw error;
        });
    }

    public static async authorize(req: BaseRequest, res: BaseResponse, next?: Function) {

        //console.log('Auth.authorize() at ' + new Date().toISOString());

        //console.log(Auth.Roles);

        /* retrieve roles previously defined (bound) */
        const roles = Authenticator.getRoles();

        /* ensure roles variable contains valid role names */
        Authenticator.validateRoles(roles);

        /* retrieve the authenticated user info */
        const loggedUser = await UserController.get_authenticated_user(req);

        /* if owner role was specified, check if the authenticated user is the owner of the user record of interest */
        if (roles.includes('owner')) {
            if (await Authenticator.isOwner(req, loggedUser)) {
                console.log('Owner role acknowledged for user ' + loggedUser.username + '.');
                if (next) return next();
                return;
            }
        }

        if (!roles.includes(loggedUser.level)) {
            return res.status(403).json({ message: 'Forbidden: User does not have the required role' });
        }

        console.log(loggedUser.level + ' role acknowledged for user ' + loggedUser.username + '.');

        if (next) return next();
    }


    private static getRoles(): string[] {
        let roles = Authenticator.hasOwnProperty('Roles') ? (Authenticator as any).Roles : '[]';

        if (typeof roles === 'string') return roles.split(',').map(role => role.trim());

        if (Array.isArray(roles) ) return [...new Set(roles)];

        return roles;
    }

    private static validateRoles(roles: string[]): void{
        // Check if the roles variable is defined and is an array of strings
        if (!(roles && Array.isArray(roles) && roles.length > 0 && roles.every(role => typeof role === 'string'))) {
            console.error('authorize: Roles must be an array of strings');
            throw new Error('authorize error');
        }

        const validRoles = ['admin', 'user', 'reader', 'owner'];

        // ensure roles variable contains valid role names
        if (!roles.every(role => validRoles.includes(role))) {
            console.error('Invalid role: ' + roles.find(role => !validRoles.includes(role)));
            throw new Error('authorize error');
        }
    }

    private static async isOwner(req: BaseRequest, loggedUser: UserEntity): Promise<boolean> {
        if (!req.body?.id && !req.query?.id && !req.body?.username && !req.query?.username) {
            //console.error('User name or id not found. Cannot check owner role.');
            throw new Error('User name or id not found.');
        }

        const mockRequest = MockRequest.create();
        mockRequest.body.id = req.body?.id || req.query?.id;
        mockRequest.body.username = req.body?.username || req.query?.username;
        const targetUser: UserEntity = await UserController.getTargetUser(mockRequest);

        return targetUser.id === loggedUser.id;
    }
}