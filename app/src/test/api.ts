import { UserEntity } from '@src/domain/entities/UserEntity';
import axios from 'axios';
import https from 'https';
import fs from 'fs';


type data = {[key: string]: any};

export class Api {
    private authToken: string;

    private static Axios = axios.create({
        httpsAgent: new https.Agent({
          ca: fs.readFileSync('/home/blau/.certs/tz-ca.pem')
        })
      });

    private constructor(authToken: string) {
        this.authToken = authToken;
    }

    public static async login(username: string, password: string) {
        const response = await this.Axios.post('https://localhost:3000/auth/login', {
            username: username,
            password: password
        });

        if (response.status === 200) {
            return new Api(response.headers['authorization'] as string)
        }

        throw new Error(response.statusText);
    }

    public async addUser(user: UserEntity): Promise<data> {
        const response = await Api.Axios.post('https://localhost:3000/api/v1/user', user, {
            headers: {
                'Authorization': this.authToken
            }
        });

        console.log("============================");

        if (response.status !== 201) 
            throw new Error(response.data || response.statusText);

        return response.data;
    }

    public async updateUser(user: Partial<UserEntity>): Promise<data> {
        const response = await Api.Axios.put('https://localhost:3000/api/v1/user', user, {
            headers: {
                'Authorization': this.authToken
            }
        });

        if (response.status !== 200) 
            throw new Error(response.statusText);

        return response.data;
    }

    public async getUsers(): Promise<data[]> {
        const response = await Api.Axios.get('https://localhost:3000/api/v1/users', {
            headers: {
                'Authorization': this.authToken
            }
        });

        if (response.status !== 200) 
            throw new Error(response.statusText);

        return response.data;
    }

    public async getUser(id: number): Promise<data> {
        const response = await Api.Axios.get(`https://localhost:3000/api/v1/user?id=${id}`, {
            headers: {
                'Authorization': this.authToken
            }
        });

        if (response.status !== 200)
            throw new Error(response.statusText);

        return response.data;
    }
}

((async () => {
    const username = "admin";
    const password = "L@bastrav1a";

    const api = await Api.login(username, password);
    await api.getUsers().then((users: any) => 
        users.forEach((user: any) => console.log(user)
    ));
    await api.getUser(1).then((user: any) => console.log(user));
    await api.addUser({ 
        username: "jane", 
        email: "jane@example.com", 
        password: "L@bastrav1a", 
        fullname: "Jane Doe", 
        level: "user" 
    }).then((user: any) => 
        console.log(user)
    ).catch((error: any) => 
        console.log(error.message));
    //api.updateUser({ id: 1, username: "admin", password: "L@bastrav1a", fullname: "Admin User", level: "admin" });
}))();