//import 'reflect-metadata';
import { NotFoundError } from '@src/shared/Errors';
import { TokenService } from '@src/infrastructure/security/TokenService';
import { config } from '@src/config/config';
import { UserRepository } from '@src/domain/repositories/UserRepository';

/**
 * dive deep into the instance looking for the wanted property
 * 
 * @param instance of a class
 * @param property 
 * @returns the property descriptor
 */
function getPropertyDescriptor(instance: any, property: string): PropertyDescriptor | undefined {
    const re = new RegExp(property, 'i');
    const prop = Object.getOwnPropertyNames(instance).find(prop => {
        return re.test(prop);
    });
    const descriptor = Object.getOwnPropertyDescriptor(instance, prop || "NF");
    return descriptor;
}

/**
 * look for user id in the method's arguments
 * 
 * @param value - the parameter to check upon
 * @param patterns - one or more patterns to look for into objects
 * @returns the user id
 */
function getUserId(value: { [key: string]: any } | string | number, ...patterns: string[]): string | number | undefined  {
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    } else if (typeof value === 'object') {
        const key = Object.keys(value).find(key => patterns.includes(key.toLowerCase()));
        return key ? value[key] : undefined;
    }
    return undefined;
}

type Role = 'admin' | 'user' | 'reader' | 'owner';

/**
 * Authorize decorator to enforce role-based and ownership-based access control on a method.
 * The functioning of this decorator is based upon the Request object passed to the method.
 * Also, the method's class must have an instance of the UserService class.
 *
 * @param {...('admin' | 'user' | 'reader' | 'owner')} requiredRoles - The roles that are allowed to access the method.
 *
 * @example
 * // Allow only admin users to access the method
 * @Authorize('admin')
 * async updateUser(req: BaseRequest, res: BaseResponse) {
 *   // method logic
 * }
 *
 * @example
 * // Allow both admin users and the owner of the resource to access the method
 * @Authorize('admin', 'owner')
 * async updateUser(req: BaseRequest, res: BaseResponse) {
 *   // method logic
 * }
 *
 * @throws {Error} If the user is not authenticated or does not have the required permissions.
 * @throws {Error} If the UserService instance is not found in the class prototype chain.
 */
export function authorize(...requiredRoles: Role[]): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {

          // Ensure descriptor and original method exist
        const originalMethod = descriptor!.value!;

        // Wrap original method with authorization logic
        descriptor!.value = async function (...args: any[]) {
            try {
                // retieve UserRepository instance
                let descriptor = getPropertyDescriptor(this, "repo");
                if (!descriptor || !UserRepository.isChildOfMine(descriptor.value)) 
                {
                    console.error("Authorize: UserRepository instance not found.");
                    throw new Error('Required UserRepository instance not found in decorated method\'s class: ' + String(propertyKey));
                }
                const userRepository = descriptor.value;

                //Object.getOwnPropertyNames(this).forEach(prop => console.log(prop));

                // retieve authentication token
                descriptor = getPropertyDescriptor(this, "token");
                if (!descriptor || typeof descriptor.value !== 'string') {
                    console.error("Authorize: Auth token not found.")
                    throw new Error('Required token instance not found in decorated method\'s class: ' + String(propertyKey));
                }
                const token = descriptor.value.replace(/Bearer /i, '');

                // Extract user id from token
                const oToken = await TokenService.secret(config.token.secret).unwrap(token);

                if (!oToken || !oToken.id) {
                    console.error('Authorize: Could not find authenticated user ID in headers');
                    throw new Error("Couldn't find out the authenticated user ID");
                }

                const authUserId = oToken.id;

                // Remove roles duplicates
                const roles = [...new Set(requiredRoles)];

                // Helper function to find the user id to be searched in the database
                const targetUserId = getUserId(args[0], 'id', 'userid', 'user_id'); // assume args[0] has the user id or an object that has the user id

                if (!targetUserId) {
                    console.error('Authorize: Could not find user ID in the method arguments');
                    throw new NotFoundError('Record ownership could not be verified');
                }

                // special case for role owner
                if (roles.includes('owner')) {

                    //console.log('Authorize Owner userID: ' + authUserId);
                    //console.log('Authorize Owner targetUserID: ' + targetUserId);

                    if (authUserId.toString() === targetUserId.toString()) {
                        return originalMethod.apply(this, args);
                    }

                    // if role 'owner' is the only role specified, throw error
                    if (roles.length === 1) {
                        console.error("Authorize: User id '" + authUserId + "' cannot take action on behalf of user id '" + targetUserId + "'");
                        throw new AuthorizeError('User does not have the required permissions');
                    }
                }

                const user = await userRepository.findById(parseInt(authUserId as string));
                
                /* 
                const user = {
                    id: 1,
                    name: 'Joe',
                    level: 'admin',
                    age: 40
                } */

                if (!user) {
                    console.error("Authorize: Authenticated user id " + authUserId + " not found in database");
                    throw new NotFoundError('User not found');
                }

                console.log('Authorize Role userID: ' + authUserId);
                console.log('Authorize Role userRole: ' + user.level);

                if (!roles.includes(user.level as 'admin' | 'user' | 'reader')) {
                    console.error("Authorize: User id '" + authUserId + "' does not have the required role: " + roles.join(', '));
                    throw new AuthorizeError('User does not have the required permissions');
                }

                // Call original method with updated context (`this`)
                return originalMethod.apply(this, args);

            } catch (err) {
                console.error(err);
                if (err instanceof NotFoundError || err instanceof AuthorizeError) {
                    throw err;
                } else {
                    throw new Error('Internal Server Error');
                }
            }
        };

        return descriptor;
    };
}

class AuthorizeError extends Error {
    constructor(message: string = "Account locked") {
        super(message);
        this.name = "AccountLockedError";
    }
}
