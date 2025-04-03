export class Data<T> {
    private constructor(private readonly data: T) {}
    
    static from<T>(data: T): Data<T> {
        return new Data<T>(data);
    }

    map<U>(func: (arg: any) => U): Data<U> {
        let result: any;

        if (Array.isArray(this.data)) 
            result = (this.data as T[]).map(item => func(item));
        else
            result = func(this.data);
        
        return new Data<U>(result);
    }

    collect(): T {
        return this.data;
    }
}