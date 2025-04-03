// UserRepository interface and MockUserRepository implementation (unchanged)
interface UserRepository {
    findById(userId: string): { id: string; email: string } | null;
}

class MockUserRepository implements UserRepository {
    findById(userId: string) {
        // Simulated database query
        //return { id: userId, email: 'test@example.com' }; // Replace with actual database logic
        return { id: userId, email: '' };
    }
}

// Decorator (unchanged)
function InjectRepository(repository: UserRepository) {
    console.log("InjectRepository #1");
    return function <T extends new(...args: any[]) => {}>(constructor: T) {
        console.log("InjectRepository #2");
        return class extends constructor {
            private readonly userRepositoryInstance = repository;

            constructor(...args: any[]) {
                console.log("InjectRepository #3");
                super(...args);
                const user = this.userRepositoryInstance.findById('123');
                if (!user) {
                    throw new Error('User not found');
                } else {
                    if (!user.email) {
                        throw new Error('User email not found');
                    }
                }
                // Optionally initialize properties or perform setup here
            }

            getUserDetails(userId: string) {
                const user = this.userRepositoryInstance.findById(userId);
                // Perform validations or other logic
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
        };
    };
}

// Service class with explicitly defined property
@InjectRepository(new MockUserRepository())
class UserService {
    private readonly userRepositoryInstance!: UserRepository; // Define the property

    constructor() {
        console.log("UserService #1");
    } // Optional constructor if needed

    getUserDetails(userId: string) {
        const user = this.userRepositoryInstance.findById(userId);
        // Perform validations or other logic
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

// Usage remains the same
const userService = new UserService();
const userDetails = userService.getUserDetails('123');
console.log(userDetails);
