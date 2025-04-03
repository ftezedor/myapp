/*
 * models/users.js
 */
import { DataTypes, Model, Optional } from 'sequelize';
//import { sequelize } from '../sequelize';
import sequelize from '../SequelizeWrapper';
import { Secure } from '../../../shared/utils/Security';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    salt: string;
    fullname: string;
    level: string;
    retries: number;
    lockUntil: Date;
    // Add other fields as necessary
  }
  
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'lockUntil'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id!: number;
    username!: string;
    email!: string;
    password!: string;
    salt!: string;
    fullname!: string;
    level!: string;
    retries!: number;
    lockUntil!: Date;
}
 
UserModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level: {
        type: DataTypes.ENUM('admin', 'user', 'reader'),
        allowNull: false
    },
    retries: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
{
    sequelize: sequelize, 
    modelName: 'users',
    timestamps: false
});

(async () => {
    try 
    {
        await sequelize.sync({ force: false });

        const accounts = [
            {username: "admin", fullname: "Admin User", level: "admin"},
            {username: "johndoe", fullname: "John Doe", level: "user"},
            {username: "janedoe", fullname: "Jane Doe", level: "reader"}
        ];

        for (const account of accounts) {
            let user = await UserModel.findOne({ where: { username: account.username } });

            if (user) {
                if (await Secure.Password.validate('changeme', user.salt, user.password))
                {
                    console.warn('Default password for user ' + account.username + ' has been detected and it needs to be changed as soon as possible.');
                }
                continue;
            }

            const salt = await Secure.Password.salt();

            user = await UserModel.create({
                username: account.username,
                email: account.username + '@email.com',
                password: await Secure.Password.hash('changeme', salt),
                salt: salt,
                fullname: account.fullname,
                level: account.level,
                retries: 3 // number of login attempts left
            });

            console.log('User ' + account.username + ' has been created with default password \'changeme\' and it needs to be changed.');
        }

    } catch (error) {
        console.error("Error synchronizing models:", error);
    }
})();
