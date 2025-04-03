import commandLineArgs from "./CommandLineArgs";

if (!commandLineArgs.has('dbconfig')) {
    throw new Error('Missing --dbconfig argument');
}