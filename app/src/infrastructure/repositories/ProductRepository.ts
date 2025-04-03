import { BaseRepository } from "@src/infrastructure/repositories/BaseRepository";
import { ProductEntity } from "@src/domain/entities/ProductEntity";
//import ProductEntity from "@src/domain/entities/ProductEntity";

export default class ProductRepository implements BaseRepository<ProductEntity> {
    private readonly products = [{
        id: 1,
        name: 'Product 1',
        price: 100
    }, {
        id: 2,
        name: 'Product 2',
        price: 200
    }, {
        id: 3,
        name: 'Product 3',
        price: 300
    }, {
        id: 4,
        name: 'Product 4',
        price: 400
    }, {
        id: 5,
        name: 'Product 5',
        price: 500
    }];

    create(entity: ProductEntity): Promise<ProductEntity> {
        throw new Error("Method not implemented.");
    }

    update(updates: Partial<ProductEntity>): Promise<ProductEntity | null> {
        throw new Error("Method not implemented.");
    }

    findById(id: string | number): Promise<ProductEntity | null> {
        const prod = this.products.find(prod => prod.id === id);
        return Promise.resolve(prod! as ProductEntity);
    }

    findByName(id: string): Promise<ProductEntity | null> {
        throw new Error("Method not implemented.");
    }

    findAll(): Promise<ProductEntity[]> {
        return Promise.resolve(this.products as ProductEntity[]);
    }

    deleteById(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    count(query?: any): Promise<number> {
        throw new Error("Method not implemented.");
    }

    query(query: any): Promise<ProductEntity[]> {
        throw new Error("Method not implemented.");
    }
}