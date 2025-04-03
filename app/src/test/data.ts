import { Data } from "@src/shared/utils/Data";

const data = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];

const D = Data.from(data).map(l => l.toUpperCase()).collect();
    
console.log(D);