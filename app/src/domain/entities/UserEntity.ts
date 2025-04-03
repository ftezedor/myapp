//import { UserResponse } from "@src/application/services/UserResponseType";

export class UserEntity {

    constructor(
        readonly username: string,
        readonly email: string,
        readonly password: string,
        readonly fullname: string,
        readonly level: string,
        readonly salt?: string,
        readonly id?: number,
        readonly retries?: number,
        readonly lockUntil?: Date,
    ) {
    }
/*
    public toResponse(): UserResponse {
        return {
            id: this.id!,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
            level: this.level,
            status: this.retries! > 0 ? "active" : "locked"
        }
    }
*/
}