import { Injectable } from '@nestjs/common';
import Product from '../model/Product';

@Injectable()
export class ProductService {
  private lastId = 0;
  private product: Product[] = [];

  getAll(): Product[] {
    return this.product;
  }

  add(product: Product): Product {
    product.id = this.lastId;
    this.lastId++;
    this.product.push(product);

    return product;
  }

  delete(id: number): Product {
    const index = this.product.findIndex((product) => product.id == id);

    if (index < 0) {
      return null;
    }

    const deletedProduct = this.product[index];
    this.product.splice(index, 1);

    return deletedProduct;
  }
}
