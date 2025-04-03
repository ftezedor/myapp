class Check {
    private error: typeof Errorl = Error;
    private value: boolean;

    public constructor(value: boolean) {
        this.value = value;
    }

    public static ifNull(value: any): Check {
        const b = value === null || value === undefined;
        return new Check(b);
    }

    public using(error: typeof Error): this {
        this.error = error;
        return this;
    }

    public shout(msg: string): void {
        if (!this.value) return;
        throw new this.error(msg);
    }

    public negate(): this {
        this.value = !this.value;
        return this;
    }
}

Check.ifNull(process.env.XUPS)
     .negate()
     .using(TypeError)
     .shout('Missing environment variable.');