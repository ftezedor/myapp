import { Secure } from "@src/shared/utils/Security";
//import { error } from "console";

export class TokenService {
    private readonly _secret: string;
    private _data: {[key: string]: string | number} | undefined;

    private constructor(secret: string) {
        this._secret = secret;
    }

    public static secret(value: string): TokenService {
        return new TokenService(value);
    }

    /**
     * Gets the encrypted token
     * 
     * @param msg the message to wrap in the token
     * @returns the encrypted token
     */
    public async generate(msg: string | {[key: string]: string | number}, expire: number = 360): Promise<string> {
        const epochTimeInSeconds = Math.floor(Date.now() / 1000) + Math.abs(expire);
        if (typeof msg === "string") {
            msg = { message: msg, expire: epochTimeInSeconds };
        } else {
            msg.expire = epochTimeInSeconds;
        }
        //console.log("TokenService.generate() msg=" + JSON.stringify(msg));
        return await this.encode(msg);
    }

    private async encode(msg: {[key: string]: string | number}): Promise<string> {
        const token = JSON.stringify(msg);
        return Secure.Cypher.encrypt(token, this._secret);
    } 

    /**
     * Gets the data from the token
     * 
     * @param token the encrypted token
     * @returns json formatted data
     */
    public async unwrap(token: string): Promise<{[key: string]: string | number}> {
        return this.decode(token);
    }

    private async decode(token: string): Promise<{[key: string]: string | number}> {
        //console.log("TokenService.decode() secret=" + this._secret);
        //console.log("TokenService.decode() token=" + token);
        const decrypted = Secure.Cypher.decrypt(token, this._secret);
        //console.log("TokenService.decode() decrypted=" + decrypted);
        this._data = JSON.parse(decrypted);
        if (await this.isExpired())
            throw new ExpiredTokenError();
        return this._data!;
    }

    public async isExpired(): Promise<boolean> {
        //if (!(this._data && this._data.expire)) 
        if (!this._data!.expire)
            throw new InvalidTokenError();

        const epochTimeInSeconds = Math.floor(Date.now() / 1000);

        //console.log("TokenService.isExpired() epochTimeInSeconds=" + epochTimeInSeconds);
        //console.log("TokenService.isExpired() this._data.expire=" + this._data.expire);

        if (typeof this._data!.expire === "string")
            return epochTimeInSeconds > parseInt(this._data!.expire);

        if (typeof this._data!.expire === "number")
            return epochTimeInSeconds > this._data!.expire;

        return false;
    }

    public async validate(token: string): Promise<boolean> {
        try
        {
            await this.decode(token);
            return true
        }
        catch (error)
        {
            //console.log("TokenService.validate() error: " + (error as Error).message);
            return false;
        }
    }
}

export class InvalidTokenError extends Error {
    constructor() {
        super("Invalid token");
    }
}

export class ExpiredTokenError extends Error {
    constructor() {
        super("Expired token");
        Object.setPrototypeOf(this, ExpiredTokenError.prototype)
    }
}   