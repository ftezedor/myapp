import { PasswordError } from "@src/shared/Errors";

export default function validatePassword(password: string): void {
    const errors: string[] = [];

    // Check password length
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter.");
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one digit.");
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character.");
    }

    // Check for spaces
    if (/\s/.test(password)) {
        errors.push("Password must not contain spaces.");
    }

    if (errors.length > 0) {
        throw new PasswordError(errors.join('\n'));
    }
}
