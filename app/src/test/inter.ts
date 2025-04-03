import { Secure } from "@src/shared/utils/Security";

class StringUtils {
    /**
     * Intertwines two strings by alternating characters from each.
     * If one string is longer, its remaining characters are appended at the end.
     * 
     * @param s1 - The first string.
     * @param s2 - The second string.
     * @returns The intertwined string.
     */
    static intertwine(s1: string, s2: string): string {
        let result = '';
        const minLength = Math.min(s1.length, s2.length);

        // Alternate characters from both strings
        for (let i = 0; i < minLength; i++) {
            result += s1[i] + s2[i];
        }

        // Append remaining characters (if any)
        if (s1.length > minLength) {
            result += s1.slice(minLength);
        } else if (s2.length > minLength) {
            result += s2.slice(minLength);
        }

        return result;
    }
}


async function test()
{
    const pass = "changeme";
    const salt = "985256126889126f";

    let s = await Secure.Password.intertwine(pass, salt);

    console.log(s);

    s = StringUtils.intertwine(pass, salt);

    console.log(s);
}

test();