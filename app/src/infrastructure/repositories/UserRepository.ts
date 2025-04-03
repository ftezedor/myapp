import { FoundError, NotFoundError } from "@src/shared/Errors";
//import { BaseRepository } from "./BaseRepository";
import { UserEntity } from "@src/domain/entities/UserEntity";
import { UserModel } from "@src/infrastructure/sequelize/models/UserModel";
import { Secure } from "@src/shared/utils/Security";
import { UserRepository as IUserRepository } from "@src/domain/repositories/UserRepository";

export default class UserRepository implements IUserRepository {

    async create(data: UserEntity): Promise<UserEntity> {
        await UserModel.findOne({ where: { username: data.username } }).then(user => {
            if (user) throw new FoundError("User '" + data.username + "' already exists");
        });

        await UserModel.findOne({ where: { email: data.email } }).then(user => {
            if (user) throw new FoundError("Email '" + data.email + "' is already being used by another user");
        });

        const salt: string = (!data.hasOwnProperty("salt") || !data.salt ? Secure.Cypher.generateSalt(16) : data.salt);

        return await UserModel.create({
            username: data.username,
            email: data.email,
            password: await Secure.Password.hash(data.password, salt),
            salt: salt,
            fullname: data.fullname,
            level: data.level,
            retries: 3,
        }).then(user => {
            return user as UserEntity;
        });
    }

    async update(updates: Partial<UserEntity>): Promise<UserEntity> {
        //console.log("updates: " + JSON.stringify(updates));
        return await UserModel.findByPk(updates.id).then(user => {
            if (!user)
                throw new NotFoundError("User not found");
            return user;
        }).then(async user => {
            if (updates.username) user.username = updates.username;
            if (updates.password) user.password = await Secure.Password.hash(updates.password, user.salt);
            if (updates.email) user.email = updates.email;
            if (updates.fullname) user.fullname = updates.fullname;
            if (updates.level) user.level = updates.level;
            if (updates.retries !== undefined) user.retries = updates.retries;
            if (updates.lockUntil !== undefined) user.lockUntil = updates.lockUntil;
            return await user.save();
        }).then(user => {
            return this.toEntity(user);
        })
    }

    async findById(id: number): Promise<UserEntity | undefined> {
        return await UserModel.findByPk(id).then(user => {
            return user ? this.toEntity(user) : undefined;
        })
    }

    async findByUsername(username: string): Promise<UserEntity | undefined> {
        return await UserModel.findOne({ where: { username: username } }).then(user => {
            return user ? this.toEntity(user) : undefined
        })
    }

    async findAll(): Promise<UserEntity[]> {
        return await UserModel.findAll().then(users => {
            return users.map(user => this.toEntity(user));
        })
    }

    async deleteById(id: number): Promise<boolean> {
        return await UserModel.destroy({ where: { id: id } }) > 0;
    }

    count(query?: any): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async query(query: any): Promise<UserEntity[]> {
        return await UserModel.findAll({ where: query }).then(users => {
            return users.map(user => this.toEntity(user));
        })
    }

    private toEntity(user: UserModel): UserEntity {
        return new UserEntity(
            user.username,
            user.email,
            user.password,
            user.fullname,
            user.level,
            user.salt,
            user.id,
            user.retries,
            user.lockUntil
        );
    }
}