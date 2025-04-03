import { UserEntity } from "@src/domain/entities/UserEntity";
import { UserRepository } from "@src/domain/repositories/UserRepository";

export class MockUserRepository implements UserRepository {
    create(user: UserEntity): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }
    update(user: Partial<UserEntity>): Promise<UserEntity> {
        return Promise.resolve({
            username: user.username || "admin",
            email: user.email || "mock@email.com",
            password: user.password || "$2b$12$fGnIY26/XUS7LSkcK.S.Y.4zRB10wpWJQCS4.3u6ESyFCJNY3ksjK",
            fullname: user.fullname || "Mock User",
            level: user.level || "admin",
            salt: user.salt || "985256126889126f",
            id: user.id || 1,
            retries: user.retries || 3,
            lockUntil: user.lockUntil || undefined
        });
    }
    findById(id: number): Promise<UserEntity | undefined> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }
    query(query: any): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }
    deleteById(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    findByUsername(username: string): Promise<UserEntity | undefined> {
        return Promise.resolve(new UserEntity(
            username,
            "mock@email,com",
            "$2b$12$fGnIY26/XUS7LSkcK.S.Y.4zRB10wpWJQCS4.3u6ESyFCJNY3ksjK",
            "Mock User",
            "admin",
            "985256126889126f",
            1
        ));
    }
    count(query?: any): Promise<number> {
        throw new Error("Method not implemented.");
    }
}