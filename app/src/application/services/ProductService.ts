import { ProductEntity } from "@src/domain/entities/ProductEntity";
import ProductRepository from "@src/infrastructure/repositories/ProductRepository";
import { MissingPropertyError, NotFoundError } from "@src/shared/Errors";
import { Validator } from "@src/shared/utils/InputValidator";


export class ProductService {
    constructor(readonly repository: ProductRepository) {
    }

    async getProduct(prod: Partial<ProductEntity>): Promise<ProductEntity> {
        if (prod.id) 
            return await this.getProductById(prod);
  
        throw new MissingPropertyError("Product not found");
    }

    async getProducts(): Promise<ProductEntity[]> {
        return await this.repository.findAll().then(prods => {
            return prods.map((prod) => this.toEntity(prod));
        });
    }

    async getProductById(prod: Partial<ProductEntity>): Promise<ProductEntity> {
        this.validateInput('getProductById', prod);
        const eProd = await this.repository.findById(prod.id!);
        if (!eProd) {
            throw new NotFoundError("Product not found");
        }
        return this.toEntity(eProd);
    }

    async getProductByName(prod: Partial<ProductEntity>): Promise<ProductEntity> {
        this.validateInput('getProductByName', prod);
        const eProd = await this.repository.findByName(prod.name!);
        if (!eProd) throw new NotFoundError("Product not found");
        return this.toEntity(eProd);
    }

    async createProduct(prod: ProductEntity): Promise<ProductEntity> {
        this.validateInput('createProduct', prod);
        const eProd = await this.repository.create(prod);
        if (!eProd) throw new NotFoundError("Product could not be created");
        return this.toEntity(eProd);
    }

    //@authorize("admin", "owner")
    async updateProduct(prod: Partial<ProductEntity>): Promise<ProductEntity> {
        this.validateInput('updateProduct', prod);
        const eProd = await this.repository.update(prod);
        if (!eProd) throw new NotFoundError("Product could not be updated");
        return this.toEntity(eProd);
    }

    /**
     * Takes a ProductEntity and returns a ProductEntity with password and salt masked
     * @param prod 
     * @returns ProductEntity
     */
    private toEntity(prod: ProductEntity): ProductEntity {
        return new ProductEntity(
            prod.id,
            prod.name,
            prod.price
        );
    }

    public static isChildOfMine(obj: any): boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        if (obj instanceof ProductService) {
            return true;
        }

        const hasRequiredProperties =
            typeof obj.getProduct === 'function' &&
            typeof obj.getProducts === 'function' &&
            typeof obj.getProductById === 'function' &&
            typeof obj.getProductByUsername === 'function' &&
            typeof obj.createProduct === 'function' &&
            typeof obj.updateProduct === 'function';

        return hasRequiredProperties;
    }

    private validateInput(method: string, obj: { [key: string]: any }) {
        const valids: Valids = {
            'id': { type: 'number', required: false }, 
            'username': { type: 'string', required: false },
            'password': { type: 'string', required: false }, 
            'email': { type: 'string', required: false }, 
            'fullname': { type: 'string', required: false }, 
            'level': { type: 'string', required: false }, 
            'salt': { type: 'string', required: false }, 
            'retries': { type: 'number', required: false }, 
            'lockUntil': { type: 'date', required: false },
            'status': { type: 'string', required: false }
        };
        
        if (method === 'getProductById') {
            valids.id.required = true;
            valids.username.required = false;
        } else if (method === 'getProductByUsername') {
            valids.id.required = false;
            valids.username.required = true;
        } else if (method === 'createUser') {
            valids.id.required = false;
            valids.username.required = true;
            valids.password.required = true;
            valids.email.required = true;
            valids.fullname.required = true;
            valids.level.required = true;
        } else if (method === 'updateUser') {
            valids.id.required = true;
        } else {
            throw new Error(`method '${method}' not known.`);
        }

        //console.log("UserService.validateInput() method=", method);
        //console.log("UserService.validateInput() obj=", JSON.stringify(obj));
        //console.log("UserService.validateInput() valids=", JSON.stringify(valids));

        Validator.validateInput(obj, valids);

        /*
        // search for invalid keys in the input
        Object.keys(obj).forEach(key => {
            if (!(key in valids)) {
                throw new InvalidPropertyError(`${key} is not valid.`);
            }
        });
        // search for missing keys in the input
        Object.keys(valids).forEach(key => {
            if (valids[key].required)
            {
                if (!(key in obj) || !obj[key]) 
                    throw new MissingPropertyError(`'${key}' is required.`);
    
                if (typeof obj[key] !== valids[key].type)
                    throw new TypeError(`'${key}' must be a ${valids[key].type}.`);
            }
        }); 
        */
    }

}

interface Valids {
    [key: string]: {
        type: number | string | Date;
        required: boolean;
    };
}