import BaseEntity from "./BaseEntity";

export class ProductEntity implements BaseEntity {

    constructor(
        public id: number,
        public name: string,
        public price: number
    ) {}

}