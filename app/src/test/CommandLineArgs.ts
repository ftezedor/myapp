type CommandLineArgsRecord = Record<string, string | null>;

class CommandLineArgs {
    private readonly args: CommandLineArgsRecord;

    constructor() {
        this.args = this.parseArgs();
    }

    private parseArgs(): CommandLineArgsRecord {
        const argArr = process.argv.slice(2);
        const argObj: CommandLineArgsRecord = {};

        for (let i = 0; i < argArr.length; i++) {
            const arg = argArr[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                let value: string | null = null;
                if (i + 1 < argArr.length && !argArr[i + 1].startsWith('--')) {
                    value = argArr[i + 1];
                    i++; // Increment to skip the value
                }
                argObj[key] = value;
            } else {
                throw new Error("Unexpected argument " + arg + "}. All arguments must be in the form '--key [value]'.");
            }
        }

        return argObj;
    }

/**
 * Retrieves the value associated with the specified key from the command line arguments.
 * 
 * @param key - The key whose associated value is to be returned.
 * @returns The value associated with the specified key, or null if the key is not present.
 */
    get(key: string): string | null {
        return this.args[key];
    }

    /**
     * Returns a shallow copy of the entire CommandLineArgs object.
     * @returns A shallow copy of the CommandLineArgs object.
     */
    getAll(): CommandLineArgsRecord {
        return { ...this.args };
    }

    /**
     * Returns true if the command line argument `key` has been set to some value (including null).
     * @param key The key to check.
     * @returns Whether the key has a value or not.
     */
    has(key: string): boolean {
        return key in this.args;
    }
}

const commandLineArgs = new CommandLineArgs();
export default commandLineArgs;

class MissingArgumentError extends Error {}

export { MissingArgumentError };