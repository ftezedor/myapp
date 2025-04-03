import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class Secure
{
    static readonly Password = class
    {
        static async salt()
        {
            //const salt = await bcrypt.genSalt(12);
            const salt = Secure.Cypher.generateSalt(16);
            return salt;
        }

        /**
         * Derive key from password and salt
         * 
         * @param {*} password 
         * @param {*} salt 
         * 
         * @returns key
         */
        static async deriveKey(password: string, salt: string): Promise<Buffer> 
        {
            return new Promise((resolve, reject) => {
              crypto.pbkdf2(password, salt, 10000, 32, 'sha256', (err, key) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(key);
                }
              });
            });
        }

        /**
         * Encrypt the password
         * 
         * @param {*} password 
         * @param {*} salt 
         * 
         * @returns 
         */
        static async encryptPassword(password: string, salt: string)
        {
            // derive a key from the password and salt
            const key = await this.deriveKey(password, salt);

            // blend the password and salt
            const pwd = await this.intertwine(password, salt);

            // password than is encrypted using the derived key
            return Secure.Cypher.encrypt(pwd, key);
        }

        /**
         * Takes the password and salt and hash the password
         * 
         * @param {*} password 
         * @param {*} salt 
         * 
         * @returns hashed password
         */
        static async hash(password: string, salt: string) 
        {
            /*
            * hashes the encrypted password instead of the plain text one
            */
            try 
            {
                // encrypt the password
                const secret = await this.encryptPassword(password, salt);
                //console.log("encrypted password=" + secret + " (" + secret.length + ")");
                // get the bcript hash of the encrypted password
                const hash = await bcrypt.hash(secret, 12);
                //console.log("hashed password=" + hash + " (" + hash.length + ")");
                return hash;
            } 
            catch (error: any) 
            {
                // Handle any errors
                console.error('Error hashing password:', error.message);
                throw error;
            }
        }

        static async validate(password: string, salt: string, hashedPassword: string)
        {
            //console.log("password=" + password + " (" + password.length + ")");
            //console.log("salt=" + salt + " (" + salt.length + ")");
            //console.log("hash=" + hashedPassword + " (" + hashedPassword.length + ")");

            // encrypt the password
            const secret = await this.encryptPassword(password, salt)
            //console.log("secret=" + secret + " (" + secret.length + ")");
            // compare the encrypted password with the already hashed one
            const match = await bcrypt.compare(secret, hashedPassword);
/*
            console.log("password=" + password + " (" + password.length + ")");
            console.log("salt=" + salt + " (" + salt.length + ")");
            console.log("ekey=" + ekey.toString('hex'));
            console.log("secret=" + secret + " (" + secret.length + ")");
            console.log("hash=" + hashedPassword + " (" + hashedPassword.length + ")");
*/
            return match;
        }

        static async intertwine(s1: string, s2: string) 
        {
            const result = [];
            const maxLength = Math.max(s1.length, s2.length);
        
            for (let i = 0, x = 0, y = 0; i < maxLength; i++) 
            {
                if (x >= s1.length) x = 0
                if (y >= s2.length) y = 0
                
                result.push(s1[x++]);
                result.push(s2[y++]);
            }
        
            return result.join('');
        }
    }

    /*
    static readonly AuthToken = class
    {
        static encrypt(text: string) 
        {
            const secret = 'ErT2h^76v^^hq172d$CHt@hvQQ$6Eq1N';
            const encrypted = Secure.Cypher.encrypt(text, secret)
            return encrypted;
        }

        static decrypt(encryptedText: string) 
        {
            const secret = 'ErT2h^76v^^hq172d$CHt@hvQQ$6Eq1N';
            const decrypted = Secure.Cypher.decrypt(encryptedText, secret);
            return decrypted;
        }

        static validate(encryptedText: string)
        {
            try
            {
                const secret = 'ErT2h^76v^^hq172d$CHt@hvQQ$6Eq1N';
                Secure.Cypher.decrypt(encryptedText, secret);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
    */

    static readonly Cypher = class 
    {
        /**
         * Securely encrypts text using AES-256-GCM.
         *
         * @param text - The plaintext to encrypt.
         * @param secret - A 256-bit (32-byte) encryption key.
         * @returns The encrypted data as a single encoded string.
         */
        static encrypt(text: string, secret: string | Buffer): string {
            if (secret.length !== 32) {
                throw new Error('Secret key must be 32 bytes (256 bits) for AES-256-GCM.');
            }

            if (typeof secret === 'string') {
                secret = Buffer.from(secret);
            }

            const iv = crypto.createHash('md5').update(text).update(secret).digest();
            const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);

            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const authTag = cipher.getAuthTag(); // Get authentication tag

            // Encode IV, ciphertext, and authTag into a single string
            return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
        }

        /**
         * Decrypts data securely encrypted using AES-256-GCM.
         *
         * @param encryptedData - The encoded encrypted data.
         * @param secret - A 256-bit (32-byte) encryption key.
         * @returns The decrypted plaintext.
         */
        static decrypt(encryptedData: string, secret: string | Buffer): string {
            if (secret.length !== 32) {
                throw new Error('Secret key must be 32 bytes (256 bits) for AES-256-GCM.');
            }

            if (typeof secret === 'string') {
                secret = Buffer.from(secret);
            }

            const [iv, encrypted, authTag] = encryptedData.split(':');

            if (!iv || !encrypted || !authTag) {
                throw new Error('Invalid encrypted data format.');
            }

            const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                secret,
                Buffer.from(iv, 'hex')
            );

            decipher.setAuthTag(Buffer.from(authTag, 'hex')); // Set the authentication tag

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        }

        /*
        static __encrypt(text: string, secret: string | Buffer) 
        {
            // Derive initialization vector (IV) from text
            const iv = crypto.createHash('md5').update(text).update(secret).digest();
            // Create a cipher using AES-256-CBC algorithm with the secret key and IV
            if (typeof secret === 'string') 
                secret = Buffer.from(secret);
            const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);

            // Encrypt the text
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Return the IV concatenated with the encrypted data
            return iv.toString('hex') + encrypted;
        }

        static __decrypt(encryptedText: string, secret: string) 
        {
            // Parse the initialization vector (IV) from the encrypted text
            const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
            // Parse the encrypted data from the encrypted text
            const encryptedData = encryptedText.slice(32);
            console.log("encryptedData=" + encryptedData);
            // Create a decipher using AES-256-CBC algorithm with the secret key and IV
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
            // Decrypt the encrypted data
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            // Return the decrypted text
            return decrypted;
        }
        */

        static generateSalt(size: number = 16) 
        {
            //return crypto.randomBytes(Math.ceil(size / 2)).toString('base64').slice(0, size);
            return crypto.randomBytes(Math.ceil(size)).toString('base64').slice(0, size);
        }
    }
}