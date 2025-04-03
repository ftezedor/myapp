import { InvalidPropertyError, MissingPropertyError } from "@src/shared/Errors";

type ValidateInput = {
    [key: string]: any
};

type Valid = {
    [key: string]: {
        type: number | string | Date
        required: boolean
    }
};

export class Validator {
    public static validateInput(input: ValidateInput, valids: Valid): boolean {
        // search for invalid keys in the input
        Object.keys(input).forEach(key => {
            if (!(key in valids)) {
                throw new InvalidPropertyError(`${key} is not valid.`);
            }
        });
        // search for missing keys in the input
        Object.keys(valids).forEach(key => {
            if (valids[key].required)
            {
                if (!(key in input) || !input[key]) 
                    throw new MissingPropertyError(`'${key}' is required.`);
            }

            if (input[key] && typeof input[key] !== valids[key].type) {
                throw new TypeError(`'${key}' must be a ${valids[key].type}.`);
            }
        });

        return true;
    }
}