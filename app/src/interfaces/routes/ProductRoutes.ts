import { BaseServer } from "@src/infrastructure/servers/base";
import ProductController from "@src/infrastructure/controllers/ProductController";
import { Authenticator } from '@src/shared/utils/Authenticator';

export default class ProductRoutes {
    public static define(server: BaseServer) {

        // Define routes for product api version 1
        server.setRoute('GET', '/api/v1/products', Authenticator.authenticate, ProductController.getProducts);

        server.setRoute('GET', '/api/v1/product', Authenticator.authenticate, ProductController.getProduct);

        server.setRoute('POST', '/api/v1/product', Authenticator.authenticate, ProductController.createProduct);

        server.setRoute('PUT', '/api/v1/product', Authenticator.authenticate, ProductController.updateProduct);

        //server.setRoute('DELETE', '/api/v1/product', Auth.authenticate, ProductController.deleteProduct);

        console.log("Routes for products api have been defined.");
    }
}   