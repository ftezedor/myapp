import UserController from './UserController';
import ProductRepository from '@src/infrastructure/repositories/ProductRepository';
import { BaseRequest, BaseResponse } from '@src/infrastructure/servers/base';
import { MissingPropertyError, NotFoundError } from '@src/shared/Errors';
import { ProductService } from '@src/application/services/ProductService';
import { ProductResponse } from '@src/domain/entities/ProductResponseType';
import { ProductEntity } from '@src/domain/entities/ProductEntity';

class ProductController {
    private static readonly productRepository = new ProductRepository();
    private static readonly productService = new ProductService(this.productRepository);
    //private static readonly loginService = new LoginService(this.productRepository);


    //@authorize("admin", "owner")
    static async getProduct(req: BaseRequest, res: BaseResponse): Promise<void> {
        try {

            if (!req.query.id && !req.query.prodname) 
                throw new MissingPropertyError("Missing product name or id");

            let prod: Partial<ProductEntity> = {
                id: parseInt(req.query.id) || undefined,
                name: req.query.prodname || undefined
            };

            const eProduct: ProductEntity = await ProductController.productService.getProduct(prod);
            
            if (!eProduct) 
                throw new NotFoundError("Product not found");

            await UserController.refreshToken(req, res);

            res.status(200).json(ProductController.toResponse(eProduct));

        } catch (error) {
            ProductController.handleError(error as Error, res);
        }
    }

    //@authorize("admin")
    static async getProducts(req: BaseRequest, res: BaseResponse) {
        try {
            const result = (await ProductController.productService.getProducts()).map((prod) => ProductController.toResponse(prod));
            await UserController.refreshToken(req, res);
            res.status(200).json(result);
        }
        catch (error) {
            ProductController.handleError(error as Error, res);
        }
    }

    //@authorize("admin")
    static async createProduct(req: BaseRequest, res: BaseResponse) {

        try {

            let eProd: ProductEntity = ProductController.toEntity(req.body);

            eProd = await ProductController.productService.createProduct(eProd);

            if (!eProd) 
                throw new NotFoundError("Product not created");

            await UserController.refreshToken(req, res);

            res.status(201).json(ProductController.toResponse(eProd));

        } catch (error) {
            ProductController.handleError(error as Error, res);
        }
    }

    //@authorize("admin", "owner")
    static async updateProduct(req: BaseRequest, res: BaseResponse) {
   
        try {
            
            /* check if product id is present in the request */
            if (!req.query.id && !req.body["id"]) 
                throw new MissingPropertyError("Missing product id");

            /* if product id is in query but not in body, copy it */
            if (req.query.id && !req.body["id"]) 
                req.body["id"] = req.query.id;

            /* convert request body into product entity */
            let eProduct = ProductController.toEntity(req.body);

            eProduct = await ProductController.productService.updateProduct(eProduct);

            if (!eProduct)
                throw new NotFoundError("Product not updated");

            await UserController.refreshToken(req, res);

            res.status(200).json(ProductController.toResponse(eProduct));

        } catch (error) {
            ProductController.handleError(error as Error, res);
        }
    }

    /**
     * Handles errors determining the appropriate response code based on the error type
     * 
     * @param error Error object
     * @param response Response object
     */
    private static handleError(error: Error, response: BaseResponse) {
        const defaultError = { status: 500, message: "Internal server error" };
        
        // Define error mapping
        const errorMap: { [key: string]: { status: number; message: string } } = {
            MissingPropertyError: { status: 400, message: error.message },
            InvalidPropertyError: { status: 400, message: error.message },
            NotFoundError: { status: 404, message: error.message },
            FoundError: { status: 409, message: error.message },
            AuthenticationError: { status: 401, message: error.message },
            AccountLockedError: { status: 403, message: error.message },
            AuthorizeError: { status: 403, message: error.message }
        };
    
        // Determine error details
        const err = errorMap[error.constructor.name] || defaultError;
    
        // Log error with stack trace for debugging
        console.error(`Error handled: ${err.message}`, error.stack);
    
        // Send response
        return response.status(err.status).json({ error: err.message });
    }
    
    /**
     * takes an object and converts it to a product entity object
     * 
     * @param obj the object to convert
     * @returns product entity object
     */
    private static toEntity(obj: any): ProductEntity {
        return new ProductEntity(
            obj.id,
            obj.name,
            obj.price
        )
    }

    /**
     * takes an object and converts it to a product response object
     * some data are not supposed to reach out the outside world, so they get removed
     * 
     * @param obj the object to convert
     * @returns product response object
     */
    private static toResponse(obj: ProductEntity): ProductResponse {
        return {
            id: obj.id,
            name: obj.name,
            price: obj.price
        }
    }


}

export default ProductController;
