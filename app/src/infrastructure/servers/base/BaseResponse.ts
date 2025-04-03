// webResponseInterface.ts
export default interface BaseResponse {
    setHeader(name: string, value: string): this;
    getHeader(name: string): string | number | string[] | undefined;
    send(body: any): void;
    json(data: any): void;
    xml(data: any): void;
    status(code: number): this;
    //get sent(): boolean;
}
