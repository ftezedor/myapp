class MyBadError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, MyBadError.prototype);
    }
}

try {
    throw new MyBadError("Bad error");
} catch (error) {
    if (error instanceof Error) {
        console.log(error.message);
    } else {
        console.log("catch did not work");
    }
}