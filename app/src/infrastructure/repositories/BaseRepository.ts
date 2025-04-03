export interface BaseRepository<T> {
    create(entity: T): Promise<T>;
    update(updates: Partial<T>): Promise<T | null>;
    findById(id: string | number): Promise<T | null>;
    findAll(): Promise<T[]>;
    deleteById(id: string): Promise<boolean>;
    count(query?: any): Promise<number>;
    query(query: any): Promise<T[]>;
    // Add additional methods as needed
}
