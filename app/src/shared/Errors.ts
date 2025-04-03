export class NotFoundError extends Error {
    constructor(message: string = "Not found") {
        super(message);
        this.name = "NotFoundError";
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
}

export class FoundError extends Error {
    constructor(message: string = "Already exists") {
        super(message);
        this.name = "FoundError";
        Object.setPrototypeOf(this, FoundError.prototype)
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = "Authentication failed") {
        super(message);
        this.name = "AuthenticationError";
        Object.setPrototypeOf(this, AuthenticationError.prototype)
    }
}

export class AccountLockedError extends Error {
    constructor(message: string = "Account locked") {
        super(message);
        this.name = "AccountLockedError";
        Object.setPrototypeOf(this, AccountLockedError.prototype)
    }
}

export class MissingPropertyError extends Error {
    constructor(message: string = "Required property is missing.") {
        super(message);
        this.name = "MissingPropertyError";
        Object.setPrototypeOf(this, MissingPropertyError.prototype)
    }
}

export class InvalidPropertyError extends Error {
    constructor(message: string = "Invalid property.") {
        super(message);
        this.name = "InvalidPropertyError";
        Object.setPrototypeOf(this, InvalidPropertyError.prototype)
    }
}

export class PasswordError extends Error {
    constructor(message: string = "Invalid password.") {
        super(message);
        this.name = "PasswordError";
        Object.setPrototypeOf(this, PasswordError.prototype)
    }
}