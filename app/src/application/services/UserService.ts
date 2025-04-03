import { UserEntity } from "@src/domain/entities/UserEntity";
import { UserRepository } from "@src/domain/repositories/UserRepository";
//import { UserResponse } from "@src/application/services/UserResponseType";
//import { authorize } from "@src/infrastructure/controllers/Authorize";
//import { authorize } from "@src/test/AuthorizeUnified";
import { MissingPropertyError, NotFoundError } from "@src/shared/Errors";
import { Validator } from "@src/shared/utils/InputValidator";
//import { getCallerName } from "@src/tools/aaa";

export class UserService {
    constructor(readonly userRepository: UserRepository) {
    }

    async getUser(user: Partial<UserEntity>): Promise<UserEntity> {
        //console.log("UserService.getUser() user=", JSON.stringify(user));
        if (user.id) 
            return await this.getUserById(user);
        
        if (user.username) 
            return await this.getUserByUsername(user);
        
        throw new MissingPropertyError("User not found");
    }

    /*
    async getUser(id: number): Promise<UserEntity> {
        return await this.userRepository.findById(id).then(user => {
            if (!user) {
                throw new NotFoundError("User not found");
            } else {
                return user;
            }
        }).then(user => this.toEntity(user));
    }
    */

    async getUsers(): Promise<UserEntity[]> {
        return await this.userRepository.findAll().then(users => {
            return users.map((user) => this.toEntity(user));
        });
    }

    async getUserById(user: Partial<UserEntity>): Promise<UserEntity> {
        //console.log(getCallerName());
        //console.log("UserService.getUserById() user=", JSON.stringify(user));
        this.validateInput('getUserById', user);
        return await this.userRepository.findById(user.id!).then(user => {
            if (!user) {
                throw new NotFoundError("User not found");
            } else {
                return user;
            }
        }).then(user => this.toEntity(user));
    }

    async getUserByUsername(user: Partial<UserEntity>): Promise<UserEntity> {
        //console.log(getCallerName());
        //console.log("UserService.getUserById() user=", JSON.stringify(user));
        this.validateInput('getUserByUsername', user);
        return await this.userRepository.findByUsername(user.username!).then(user => {
            if (!user) {
                throw new NotFoundError("User not found");
            } else {
                return user;
            }
        }).then(user => this.toEntity(user));
    }

    async createUser(user: UserEntity): Promise<UserEntity> {
        //console.log("UserService.createUser() user=", JSON.stringify(user));
        this.validateInput('createUser', user);
        return await this.userRepository.create(user).then(user => {
            if (!user) {
                throw new NotFoundError("User could not be created");
            } else {
                return user;
            }
        }).then(user => this.toEntity(user));

    }

    //@authorize("admin", "owner")
    async updateUser(user: Partial<UserEntity>): Promise<UserEntity> {
        //console.log("UserService.updateUser() user=", JSON.stringify(user));
        this.validateInput('updateUser', user);
        return await this.userRepository.update(user).then(user => {
            if (!user) {
                throw new NotFoundError("User could not be updated");
            } else {
                return user;
            }
        }).then(user => this.toEntity(user));
    }

    /**
     * Takes a UserEntity and returns a UserEntity with password and salt masked
     * @param user 
     * @returns UserEntity
     */
    private toEntity(user: UserEntity): UserEntity {
        return new UserEntity(
            user.username,
            user.email,
            "****************",
            user.fullname,
            user.level,
            "****************",
            user.id,
            user.retries,
            user.lockUntil
        );
    }

    public static isChildOfMine(obj: any): boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        if (obj instanceof UserService) {
            return true;
        }

        const hasRequiredProperties =
            typeof obj.getUser === 'function' &&
            typeof obj.getUsers === 'function' &&
            typeof obj.getUserById === 'function' &&
            typeof obj.getUserByUsername === 'function' &&
            typeof obj.createUser === 'function' &&
            typeof obj.updateUser === 'function';

        return hasRequiredProperties;
    }

    private validateInput(method: string, obj: { [key: string]: any }) {
        const valids: Valids = {
            'id': { type: 'number', required: false }, 
            'username': { type: 'string', required: false },
            'password': { type: 'string', required: false }, 
            'email': { type: 'string', required: false }, 
            'fullname': { type: 'string', required: false }, 
            'level': { type: 'string', required: false }, 
            'salt': { type: 'string', required: false }, 
            'retries': { type: 'number', required: false }, 
            'lockUntil': { type: 'date', required: false },
            'status': { type: 'string', required: false }
        };
        
        if (method === 'getUserById') {
            valids.id.required = true;
            valids.username.required = false;
        } else if (method === 'getUserByUsername') {
            valids.id.required = false;
            valids.username.required = true;
        } else if (method === 'createUser') {
            valids.id.required = false;
            valids.username.required = true;
            valids.password.required = true;
            valids.email.required = true;
            valids.fullname.required = true;
            valids.level.required = true;
        } else if (method === 'updateUser') {
            valids.id.required = true;
        } else {
            throw new Error(`method '${method}' not known.`);
        }

        //console.log("UserService.validateInput() method=", method);
        //console.log("UserService.validateInput() obj=", JSON.stringify(obj));
        //console.log("UserService.validateInput() valids=", JSON.stringify(valids));

        Validator.validateInput(obj, valids);

        /*
        // search for invalid keys in the input
        Object.keys(obj).forEach(key => {
            if (!(key in valids)) {
                throw new InvalidPropertyError(`${key} is not valid.`);
            }
        });
        // search for missing keys in the input
        Object.keys(valids).forEach(key => {
            if (valids[key].required)
            {
                if (!(key in obj) || !obj[key]) 
                    throw new MissingPropertyError(`'${key}' is required.`);
    
                if (typeof obj[key] !== valids[key].type)
                    throw new TypeError(`'${key}' must be a ${valids[key].type}.`);
            }
        }); 
        */
    }

}

interface Valids {
    [key: string]: {
        type: number | string | Date;
        required: boolean;
    };
}