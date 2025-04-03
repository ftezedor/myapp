import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import args, { MissingArgumentError } from '../../src/test/CommandLineArgs';
import { Data } from '@src/shared/utils/Data';
import { Secure } from '@src/shared/utils/Security';

function hashFile(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256'); // 256-bit (32-byte) hash
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest())); // Returns a Buffer
        stream.on('error', (err) => reject(err));
    });
}

function hashFileSync(filePath: string): Buffer {
    //const fileBuffer = fs.readFileSync(filePath); // Read file into memory
    const fd = fs.openSync(filePath, 'r'); // Open file descriptor
    const buffer = Buffer.alloc(100); // Allocate buffer for 100 bytes
    
    fs.readSync(fd, buffer, 0, 100, 0); // Read 100 bytes from the start (offset = 0)
    fs.closeSync(fd); // Close file descriptor

    return crypto.createHash('sha256').update(buffer).digest(); // Compute hash
}

function toJSON(data: string): Record<string, any> {
    return JSON.parse(fixMalformedJson(data));
}

function isJsonLike(input: string): boolean {
    const jsonRegex = /^\s*[{[].*[}\]]\s*$/s; // Matches strings that start and end with `{}` or `[]`
    return jsonRegex.test(input);
}

function fixMalformedJson(input: string): string {
    // Fix misplaced quotes and ensure keys are quoted properly
    const misplacedQuoteRegex = /([{,]\s*)([a-zA-Z_]\w*)("?\s*:)/g;
    let fixedJson = input.replace(misplacedQuoteRegex, '$1"$2"$3');

    // Ensure the first key is properly quoted
    fixedJson = fixedJson.replace(/^(\s*)([a-zA-Z_]\w*)("?\s*:)/, '$1"$2"$3');

    // Replace single quotes with double quotes for both keys and values
    fixedJson = fixedJson.replace(/'/g, '"');

    return fixedJson;
}

function processConfig(config: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
        if (value && typeof value === 'string' && value.startsWith('file://')) {
            const filePath = value.replace('file://', '');
            const resolvedPath = path.resolve(filePath); // Resolve to an absolute path
            //console.log('Reading file', resolvedPath);
            const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
            result[key] = isJsonLike(fileContent) ? processConfig(toJSON(fileContent)) : fileContent;
        } else if (value && typeof value === 'string' && value.startsWith('enc:')) {
            result[key] = decrypt(value.replace('enc:', ''));
        } else {
            result[key] = value && typeof value === 'object' ? processConfig(value) : value;
        }
    }

    return result;
}

if (!args.has('config')) {
    throw new MissingArgumentError("Configuration file not specified");
}

const cryptKey = hashFileSync(__filename);

function encrypt(data: string): string {
    return Secure.Cypher.encrypt(data, cryptKey);
}

function decrypt(data: string): string {
    return Secure.Cypher.decrypt(data, cryptKey);
}

const config = Data.from(args.get('config'))
    .map(arg => 'file://' + arg)
    .map(uri => ({config: uri }))
    .map(json => processConfig(json))
    .map(json => json.config)
    .collect();
    
export default config;

/*
const configFile = 'file://' + args.get('config');

const inputConfig = { config: configFile };

const obj = processConfig(inputConfig);

export default obj.config;
*/

/*
export const config = {
    server: {
        protocol: 'https',
        host: 'localhost',
        port: 3000,
        https: {
            key: '/home/blau/.certs/localhost.key',
            cert: '/home/blau/.certs/localhost.crt'
        }
    } as BaseServerOptions,

    database: {
        type: 'sqlitee',
        database: 'database.sqlite',
        synchronize: true,
        logging: false
    },

    token: {
        secret: 'ErT2h^76v^^hq172d$CHt@hvQQ$6Eq1N'
    },

    app: {
        authHttpHeader: 'authenticated-user-id'
    }
};
*/