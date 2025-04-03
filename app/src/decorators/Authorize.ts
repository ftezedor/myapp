import 'reflect-metadata';
import { BaseRequest } from '@src/infrastructure/servers/base';
import { UserService } from '@src/application/services/UserService';
import { NotFoundError } from '@src/shared/Errors';
import { TokenService } from '@src/infrastructure/security/TokenService';
import { config } from '@src/config/config';

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
    // Check if target is a class constructor (which means it's applied incorrectly)
    //        console.log("typeof target: " + typeof target);
    /*         if (typeof target === 'function') {
                throw new Error('Authorize decorator can only be applied to methods');
            } */

    // Get all property names of the target class
    //const propertyNames = Object.getOwnPropertyNames(target);

    // Log each property name
    //console.log('Properties of', target.name + ':', propertyNames.join(', '));

    // Find UserService instance in the class prototype chain
    //let userServiceInstance: UserService | undefined = target.userService;
    const userServiceInstance = ((tgt: any): UserService | undefined => {
      const key = Object.keys(tgt).find(key => tgt[key] instanceof UserService);
      return key ? tgt[key] : undefined;
    })(target);

    if (!userServiceInstance) {
      throw new Error('Required UserService instance not found in decorated method\'s class: ' + String(propertyKey));
    }

    // Ensure descriptor and original method exist
    const originalMethod = descriptor!.value!;

    // Wrap original method with authorization logic
    descriptor!.value = async function (...args: any[]) {
      try {
        // go through args and find request instance
        const req: BaseRequest | undefined = args.find(item => BaseRequest.isChildOfMine(item));

        if (!req) {
          console.error('Could not find request instance in args.', String(propertyKey));
          throw new Error('Required request instance not found');
        }

        //const req: BaseRequest = args[0]; // Assuming the first argument is the request object

        /*
        Object.keys(req.headers).forEach(key => {
          console.log(`${key}: ${req.headers[key]}`);
        });

        const userId = ((obj: { [key: string]: string | number }): string | number | undefined => {
          const key = Object.keys(obj).find(key => /\buser\b/i.test(key) && /\bid\b/i.test(key));
          return key ? obj[key] : undefined;
        })(req.headers);
        */

        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];   // Bearer <token>
        const userId = await TokenService.secret(config.token.secret).unwrap(token).then(data => {
              return data.id as string || undefined;
        });

        if (!userId) {
          console.error('Authorize: Could not get authenticated user ID from token.');
          throw new Error("Couldn't find out the authenticated user ID");
        }

        // Remove duplicates
        const roles = [...new Set(requiredRoles)];

        // special case for owner
        if (roles.includes('owner')) {
          // Helper function to find userId
          const findUserId = (source: { [key: string]: any }): string | number | undefined => {
            const keysToCheck = ['userId', 'id'];
            for (const key of keysToCheck) {
              if (key in source) {
                return source[key];
              }
            }
            return undefined;
          };

          const targetUserId = findUserId(req.headers) || findUserId(req.query) || findUserId(req.body);

          if (!targetUserId) {
            console.error('Authorize: Could not find user ID in headers, query parameters, or body');
            throw new NotFoundError('Record ownership could not be verified');
          }

          //console.log('Authorize Owner userID: ' + userId);
          //console.log('Authorize Owner targetUserID: ' + targetUserId);

          // if logged user is the owner of the record, grant access
          if (userId.toString() === targetUserId.toString()) {
            return originalMethod.apply(this, args);
          }

          // if role 'owner' is the only role specified, throw error
          if (roles.length === 1) {
            console.error("Authorize: User id '" + userId + "' cannot take action on behalf of user id '" + targetUserId + "'");
            throw new AuthorizeError('User does not have the required permissions');
          }
        }

        // Example: Access userServiceInstance to get user details
        const user = await userServiceInstance!.getUser(parseInt(userId as string));

        if (!user) {
          console.error("Authorize: Authenticated user id " + userId + " not found in database");
          throw new NotFoundError('User not found');
        }

        //console.log('Authorize Role userID: ' + userId);
        //console.log('Authorize Role userRole: ' + user.level);

        if (!roles.includes(user.level as 'admin' | 'user' | 'reader')) {
          console.error("Authorize: User id '" + userId + "' does not have the required role: " + roles.join(', '));
          throw new AuthorizeError('User does not have the required permissions');
        }

        // Call original method with updated context (`this`)
        return originalMethod.apply(this, args);

      } catch (err) {
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
    Object.setPrototypeOf(this, AuthorizeError.prototype);
  }
}
