import { Sequelize, Options } from 'sequelize';
//import * as fs from 'fs';
import config from '@src/config/config';

interface DBConfig {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: 'mysql' | 'sqlite' | 'postgres' | 'mssql';
    storage?: string;
}

interface Config {
    [key: string]: DBConfig;
}

class SequelizeWrapper {
    private readonly config: DBConfig;
    private readonly sequelize: Sequelize;

    constructor(configFile: Record<string, any>) {
        this.config = configFile as DBConfig;
        this.sequelize = this.initializeSequelize();
    }

/*
    private loadConfig(configFile: string): DBConfig {
        if (!fs.existsSync(configFile))
            throw new Error(`Configuration file '${configFile}' not found`);
        const content = fs.readFileSync(configFile, 'utf-8');
        const config: DBConfig = JSON.parse(content);
        return config;
    }
*/

    private initializeSequelize(): Sequelize {
        const { username, password, database, host, dialect, storage } = this.config;
        const options: Options = {
            'host'   : host,
            'dialect': dialect,
            'storage': storage, // only for sqlite
            'logging': false //console.log // log SQL queries for debugging, can be disabled or customized
        };

        if (dialect === 'sqlite') {
            console.log("Database file: " + database + "@" + storage);
        }

        //console.log(JSON.stringify(this.config));

        return new Sequelize(database, username, password, options);
    }

    public authenticate(): this {
        this.sequelize.authenticate()
        return this;
    }

    public getSequelizeInstance(): Sequelize {
        return this.sequelize;
    }
}

export default (new SequelizeWrapper(config.database)).authenticate().getSequelizeInstance();