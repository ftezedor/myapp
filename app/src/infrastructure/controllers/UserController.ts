// src/controllers/UserController.ts
import UserRepository from '@src/infrastructure/repositories/UserRepository';
import { BaseRequest, BaseResponse } from '@src/infrastructure/servers/base';
import { MissingPropertyError, NotFoundError, PasswordError } from '@src/shared/Errors';
import { UserService } from '@src/application/services/UserService';
import { LoginService } from '@src/application/services/LoginService';
import { UserResponse } from '@src/domain/entities/UserResponseType';
import { UserEntity } from '@src/domain/entities/UserEntity';
import { TokenService } from '../security/TokenService';
import validatePassword from "@src/shared/utils/Password";
import config from '@src/config/config';

class UserController {
    private static readonly userRepository = new UserRepository();
    private static readonly userService = new UserService(this.userRepository);
    private static readonly loginService = new LoginService(this.userRepository);

    static async login(req: BaseRequest, res: BaseResponse) {
        try {
            const token = await UserController.loginService.login(req.body.username, req.body.password, req.clientIp!);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Authorization', "Bearer " + token);
            res.json({ message: "Authenticated successfully" });
        } catch (error) {
            UserController.handleError(error as Error, res);
        }   
    }

    public static async refreshToken(req: BaseRequest, res: BaseResponse): Promise<void> {
        let token = req.headers['authorization'].replace("Bearer ", "");
        token = await UserController.loginService.refreshToken(token)
        res.setHeader('Authorization', "Bearer " + token);
    }

    //@authorize("admin", "owner")
    static async getUser(req: BaseRequest, res: BaseResponse): Promise<void> {
        try {
            //console.log("UserController.getUser() request=" + req);

            const userId = req.query.id;
            const userName = req.query.username;

            //if (!req.query.id && !req.query.username) 
            if (!(userId || userName))
                throw new MissingPropertyError("Missing user name or id");

            let user: Partial<UserEntity> = {
                id: parseInt(userId) || undefined,
                username: userName || undefined
            };

            //const userId: number = parseInt(req.query.id);

            const eUser: UserEntity = await UserController.userService.getUser(user);
            
            if (!eUser) 
                throw new NotFoundError("User " + user.username + " not found");

            await UserController.refreshToken(req, res);

            res.status(200).json(UserController.toResponse(eUser));

        } catch (error) {
            UserController.handleError(error as Error, res);
        }
    }

    //@authorize("admin")
    static async getUsers(req: BaseRequest, res: BaseResponse) {
        try {
            //console.log("UserController.getUsers() UserId=" + req.headers[config.app.authHttpHeader]);
            const result = (await UserController.userService.getUsers()).map((user) => UserController.toResponse(user));
            await UserController.refreshToken(req, res);
            res.status(200).json(result);
        }
        catch (error) {
            UserController.handleError(error as Error, res);
        }
    }

    //@authorize("admin")
    static async createUser(req: BaseRequest, res: BaseResponse) {

        try {

            let eUser: UserEntity = UserController.toEntity(req.body);

            validatePassword(eUser.password);

            eUser = await UserController.userService.createUser(eUser);

            if (!eUser) 
                throw new NotFoundError("User not created");

            await UserController.refreshToken(req, res);

            res.status(201).json(UserController.toResponse(eUser));

        } catch (error) {
            UserController.handleError(error as Error, res);
        }
    }

    /**
     * 
     * @param instance to inject the authorization token
     * @param token the authorization token to be injected
     * @returns the instance itself
     */
    /*
    private static injectToken(instance: any, token: string)
    {
        instance._token = token
        return instance;
    }
    */



    //@authorize("admin", "owner")
    static async updateUser(req: BaseRequest, res: BaseResponse) {
        //console.log('UserController.updateUser() at ' + new Date().toISOString());

        try {
            
            /* check if user id is present in the request */
            if (!req.query.id && !req.body["id"]) 
                throw new MissingPropertyError("Missing user id");

            /* if user id is in query but not in body, copy it */
            if (req.query.id && !req.body["id"]) 
                req.body["id"] = req.query.id;

            /* convert request body into user entity */
            let eUser = UserController.toEntity(req.body);

            if (eUser.password)
                validatePassword(eUser.password);

            eUser = await UserController.userService.updateUser(eUser);

            if (!eUser)
                throw new NotFoundError("User not updated");

            await UserController.refreshToken(req, res);

            res.status(200).json(UserController.toResponse(eUser));

        } catch (error) {
            UserController.handleError(error as Error, res);
        }
    }

    static async deleteUser(req: BaseRequest, res: BaseResponse) {
        try {
            const userId = parseInt(req.query.id);
            //await UserController.userService.deleteUser(userId);
            res.status(200).json({ message: "Not implemented yet" });
        } catch (error) {
            UserController.handleError(error as Error, res);
        }
    }

    /**
     * Handles errors determining the appropriate response code based on the error type
     * 
     * @param error Error object
     * @param response Response object
     */
    private static handleError(error: Error, response: BaseResponse) {
        const defaultError = { status: 500, message: "Internal server error" };
        
        // Define error mapping
        const errorMap: { [key: string]: { status: number; message: string } } = {
            MissingPropertyError: { status: 400, message: error.message },
            InvalidPropertyError: { status: 400, message: error.message },
            NotFoundError: { status: 404, message: error.message },
            FoundError: { status: 409, message: error.message },
            AuthenticationError: { status: 401, message: error.message },
            AccountLockedError: { status: 403, message: error.message },
            AuthorizeError: { status: 403, message: error.message },
            PasswordError: { status: 400, message: error.message }
        };
    
        // Determine error details
        const err = errorMap[error.constructor.name] || defaultError;
    
        // Log error with stack trace for debugging
        console.error(`Error handled: ${err.message}`);
    
        // Send response
        return response.status(err.status).json({ error: err.message });
    }
    
    /**
     * takes an object and converts it to a user entity object
     * 
     * @param obj the object to convert
     * @returns user entity object
     */
    private static toEntity(obj: any): UserEntity {
        return new UserEntity(
            obj.username,
            obj.email,
            obj.password,
            obj.fullname,
            obj.level,
            obj.salt,
            parseInt(obj.id),
            obj.retries,
            obj.lockUntil
        )
        
        /*
        return {
            id: obj.id,
            username: obj.username || undefined,
            password: obj.password || undefined,
            salt: obj.salt,
            email: obj.email || undefined,
            fullname: obj.fullname || undefined,
            level: obj.level || undefined,
            retries: obj.retries,
            lockUntil: obj.lockUntil
        }
        */
    }

    /**
     * takes an object and converts it to a user response object
     * some data are not supposed to reach out the outside world, so they get removed
     * 
     * @param obj the object to convert
     * @returns user response object
     */
    private static toResponse(obj: UserEntity): UserResponse {
        return {
            id: obj.id!,
            username: obj.username,
            email: obj.email,
            fullname: obj.fullname,
            level: obj.level,
            status: obj.retries! > 0 ? "active" : "locked"
        }
    }

    /* methods to support authorization classes */
    static async getTargetUser(req: BaseRequest) {
        //return await UserController.userService.getUserById({'id': parseInt(req.query.id)});
        const eUser =  UserController.toEntity(req.body);
        return await UserController.userService.getUser(eUser);
    }

    static async get_authenticated_user(req: BaseRequest): Promise<UserEntity> {
        const token = req.headers.authorization.replace("Bearer ", "");
        return await TokenService.secret(config.secrets.encKey).unwrap(token)
        .then(data => data ? data.id : null)
        .then(uid => {
            if (uid) {
                return UserController.userService.getUserById({'id': uid as number});
            } else {
                throw new Error("User not found");
            }
        });
    }
}

export default UserController;
