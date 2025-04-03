import { TokenService } from "../infrastructure/security/TokenService";
import { config } from "../config/config";
import { authorize } from "./Authorize";
import UserRepository from "@src/infrastructure/repositories/UserRepository";

class TokenProvider {
    private static token: string;

    static setToken(token: string) {
        this.token = token;
    }

    static getToken(): string {
        return this.token;
    }
}

TokenService.secret(config.token.secret).generate({ id: '3' }).then(token => TokenProvider.setToken(token));

function getInstanceVariables(instance: any): string[] {
    const properties = new Set<string>();

    let obj = instance;
    while (obj && obj !== Object.prototype) {
        Object.getOwnPropertyNames(obj).forEach(prop => properties.add(prop));
        obj = Object.getPrototypeOf(obj);
    }

    // Filter out function properties and return only instance variables
    const instanceVariables = Array.from(properties).filter(prop => typeof instance[prop] !== 'function');

    return instanceVariables;
}


class UserService {
    constructor(readonly userRepository: UserRepository) {
    }

    @authorize('admin')
    getUserData(id: string) {
        return {
            id: '3',
            name: 'John Doe'
        };
    }

    anotherMethod() {
        console.log('Another method called...');
        // Another implementation
    }

    //static createUserServiceProxy(userService: UserService): UserService {
    public static create(userRepository: UserRepository): UserService {
        return new Proxy(new UserService(userRepository), {
            get(target: any, property, receiver) {
                const originalProperty = target[property];

                if (typeof originalProperty === 'function') {
                    return function (...args: any[]) {
                        const token = TokenProvider.getToken();
                        target._token = token; // Store the token in the instance
                        return originalProperty.apply(target, args);
                    };
                }

                return originalProperty;
            }
        });
    }
}

describe('UserService', () => {
    it('should fetch user data', async () => {
        //const userService = new UserService();
        const userRepository = new UserRepository();
        const userServiceProxy = await UserService.create(userRepository);
        const userData = await userServiceProxy.getUserData("3");

        expect(userData.name).toBe('John Doe');
    })
})
