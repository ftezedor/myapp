import { LoginService } from "@src/application/services/LoginService"
import { MockUserRepository as UserRepository } from "@src/infrastructure/repositories/MockUserRepository";
import { AuthenticationError } from "@src/shared/Errors";

describe("LoginService", () => {
    const loginService = new LoginService(new UserRepository());
    let token: string | null = null;

    it("Must not authenticate with invalid credentials", async () => {
        try {
            await loginService.login("admin", "invalid", "127.0.0.1");
        } catch (error) {
            expect(error).toBeInstanceOf(AuthenticationError);
        }
    });

    it("Must authenticate with valid credentials", async () => {
        token = await loginService.login("admin", "changeme", "127.0.0.1");
        expect(token).not.toBeNull();
    });

    it("Must get data from token", async () => {
        const data = await loginService.getData(token!);
        expect(data.id).toBe(1);
    });

    it("Must fail to get data from invalid token", async () => {
       await expect(loginService.getData("a7b54e70a5f5f6f6f6f6f6f6f6f6f6f")).rejects.toThrow();
    });

});