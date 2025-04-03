export default abstract class BaseRequest {
    abstract get method(): string;
    abstract get url(): string;
    //getHeader(name: string): string | undefined;
    abstract get headers(): { [key: string]: string }
    abstract get path(): string;
    /**
     * get values from query string
     */
    abstract get query(): { [key: string]: string };
    abstract get body(): any;
    abstract get clientIp(): string | undefined; // TODO: remove clientip

    static isChildOfMine(obj: any): boolean {
        if (!obj || typeof obj !== 'object') {
          return false;
        }
    
        if (obj instanceof BaseRequest) {
          return true;
        }
    
        const hasRequiredProperties = 
          typeof obj.method === 'string' &&
          typeof obj.url === 'string' &&
          typeof obj.headers === 'object' &&
          typeof obj.path === 'string' &&
          typeof obj.query === 'object' &&
          'body' in obj &&
          (typeof obj.clientIp === 'string' || obj.clientIp === undefined);
    
        return hasRequiredProperties;
      }
}
