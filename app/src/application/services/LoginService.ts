import { UserRepository } from "@src/domain/repositories/UserRepository";
import { TokenService } from "@src/infrastructure/security/TokenService";
import { AccountLockedError, AuthenticationError, NotFoundError } from "@src/shared/Errors";
import { Secure } from "@src/shared/utils/Security";
import config from "@src/config/config";
import { UserEntity } from "@src/domain/entities/UserEntity";

export class LoginService {
    constructor(readonly userRepository: UserRepository) {}

    public async login(username: string, password: string, clientIp: string): Promise<string> {
        //console.log("LoginService.login()", username, password, clientIp);
        const user = await this.userRepository.findByUsername(username).then(user => {
            if (!user) 
                throw new NotFoundError("User not found");
            return user;
        });

        //console.log("LoginService.login() user=" + user.id! + ", username=" + user.username);

        if (user.retries! < 1 && new Date() < new Date(user.lockUntil!))
            throw new AccountLockedError("User is locked temporarily. Please try again later.");

        if (await Secure.Password.validate(password, user.salt!, user.password))
        {
            if (user.retries! < 3) 
                this.userRepository.update({ id: user.id!, retries: 3 });
            return await TokenService.secret(config.secrets.encKey).generate({ id: user.id!, source: clientIp });
        }

        const retries = user.retries! - 1;
        const lockUntil = new Date(new Date().getTime() + (Math.max(Math.abs(retries) * 3, 5) * 60000));
        await this.userRepository.update({ id: user.id!, retries: retries, lockUntil: lockUntil });
        if (retries <= 0)
            throw new AccountLockedError("Too many failed login attempts.");
        else
            throw new AuthenticationError("Authentication failed. Retries left: " + retries + ".");
    }

    public async getData(token: string): Promise<{[key: string]: string | number}> {
        return await TokenService.secret(config.secrets.encKey).unwrap(token);
    }

    public async refreshToken(token: string): Promise<string> {
        const data = await this.getData(token);
        return await TokenService.secret(config.secrets.encKey).generate(data);
    }

    public async getAuthenticatedUser(token: string): Promise<UserEntity> {
        const data = await this.getData(token);
        return await this.userRepository.findById(data.id as number).then(user => {
            if (!user) 
                throw new NotFoundError("User not found");
            return user;
        });
    }
}