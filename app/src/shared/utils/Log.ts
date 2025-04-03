import { time } from "console";

export default class Log {
// Helper function to write logs
    private static format(type: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        return args.map(m => timestamp + '  ' + type.toUpperCase() + '  ' + m).join('\n');
        //return `[${timestamp}]  [${type.toUpperCase()}]  ${message.replace(/\n/g, timestamp + '  ' + type.toUpperCase() + '  ')}`;
    }

    public static setup() {
        
    // Override console methods
        console.log = (...args: any[]) => {
            process.stdout.write(`${Log.format('info', args)}\n`);
        };

        console.error = (...args: any[]) => {
            process.stdout.write(`${Log.format('error', args)}\n`);
        };

        console.warn = (...args: any[]) => {
            process.stdout.write(`${Log.format('warn', args)}\n`);
        };
    }
}