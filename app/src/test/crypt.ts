import { Secure } from "@src/shared/utils/Security";

const secret: string = 'ErT2h^76v^^hq172d$CHt@hvQQ$6Eq1N';
const encryptedText: string = Secure.Cypher.encrypt('test', secret);
const decryptedText: string = Secure.Cypher.decrypt(encryptedText, secret);
console.log(encryptedText);
console.log(decryptedText);
