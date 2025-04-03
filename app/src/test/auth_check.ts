/* const token = "24dd63989c171404d97f9241db417f4e567ff1a28adc0526b7f74473b3eba75c40f630837a67cb27fe33b10dcdda6998c696add0ae87a2f62fc7c92120bd35166becd9b43cb3c544cb24381867386fcd";

import { Secure } from "../shared/utils/security";

const decoded = Secure.AuthToken.decrypt(token);

console.log(decoded); */

const headers = {
    "content-type": "application/json", 
    "user-agent": "PostmanRuntime/7.39.0", 
    "accept": "*/*", 
    "postman-token": "0e167d0b-a8c1-42fc-9e8c-9492bcaa6c09", 
    "host": "localhost:3000", 
    "accept-encoding": "gzip, deflate, br", 
    "connection": "keep-alive", 
    "content-length": "169", 
    "Authenticated-User-Id": "2"
    };

const xxx = ((obj: {[key: string]: string | number}): string | number | undefined => {
        const key = Object.keys(obj).find(key => /\buser\b/i.test(key) && /\bid\b/i.test(key));
        return key ? obj[key] : undefined;
    })(headers);

console.log(xxx);
