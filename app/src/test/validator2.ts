import 'reflect-metadata';

interface UserRepository {
  findById(userId: string): { id: string; email: string } | null;
}

class MockUserRepository implements UserRepository {
  findById(userId: string) {
    // Simulated database query
    return { id: userId, email: 'test@example.com' }; // Replace with actual database logic
  }
}

function InjectRepository(repository: UserRepository): ClassDecorator {
  return function (target: Function) {
    // Inject repository into class
    target.prototype.userRepositoryInstance = repository;

    // Intercept method calls
    const methods = Object.getOwnPropertyNames(target.prototype).filter(
      (prop) => typeof target.prototype[prop] === 'function' && prop !== 'constructor'
    );

    methods.forEach((method) => {
      const originalMethod = target.prototype[method];

      target.prototype[method] = function (...args: any[]) {
        console.log(`Intercepted method call: ${method} with arguments: ${JSON.stringify(args)}`);
        
        // Perform pre-processing or validation here
        // For example, authentication, logging, etc.

        const result = originalMethod.apply(this, args);

        // Perform post-processing here
        // For example, result manipulation, logging, etc.

        return result;
      };
    });
  };
}

@InjectRepository(new MockUserRepository())
class UserService {
  // Explicitly declare the property to make TypeScript aware of it
  private readonly userRepositoryInstance!: UserRepository;

  constructor(repository?: UserRepository) {
    if (repository) 
      this.userRepositoryInstance = repository;
    // Initialize any other properties if needed
  }

  getUserDetails(userId: string) {
    const user = this.userRepositoryInstance.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  addUser(id: string, email: string) {
    console.log(`Adding user with ID: ${id} and email: ${email}`);
    // Simulated adding user to the repository
  }
}

// Usage
const userService = new UserService();
console.log(userService.getUserDetails('1')); // Intercepted method call: getUserDetails with arguments: ["1"]
userService.addUser('3', 'test3@example.com'); // Intercepted method call: addUser with arguments: ["3","test3@example.com"]
console.log(userService.getUserDetails('3')); // Intercepted method call: getUserDetails with arguments: ["3"]
