
import GetUser from "../application/services/GetUser";
import MockRequest from "src/infrastructure/servers/mock/MockRequest";
import MockResponse from "../infrastructure/servers/mock/MockResponse";
import UserRepository from "../infrastructure/repositories/UserRepository";

describe('GetUserUseCase', () => {
    it('should return user details', async () => {
        /*
        const req = new MockRequest({
            method: 'GET', 
            url: '/api/v1/user?id=3', 
            headers: {
                'Content-Type': 'plain/text',
                'X-Forwarded-For': '127.0.0.1',
                'Content-Length': '0'
            }, 
            path: '/api/v1/user',
            query: {
                id: '3'}, 
            body: null
        });

        const res = new MockResponse();

        await new GetUser(UserRepository).execute(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.headers['Content-Type']).toBe('application/json');
        expect(res.body).toBe(JSON.stringify({ id: 3, name: 'Joe', age: 40 }));
        */

        const data = await new GetUser(UserRepository).execute('2');

        expect(data.name).toEqual('Jane');
    });
})