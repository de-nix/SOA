import { Controller } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import Product from './model/Product';

@Controller()
export class AppController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get-all' })
  async getProducts(): Promise<Product[]> {
    console.log('> get-all');
    return this.productService.getAll();
  }

  @MessagePattern({ cmd: 'add' })
  async addProduct(product: Product): Promise<Product> {
    console.log('> add');
    return this.productService.add(product);
  }

  @MessagePattern({ cmd: 'delete' })
  async deleteProduct(id: number): Promise<Product> {
    console.log('> delete');
    return this.productService.delete(id);
  }

  @EventPattern('read-event')
  async handleReadEvent(data: Record<string, unknown>) {
    console.log(`>>> Read event.`);
  }

  @EventPattern('write-event')
  async handleWriteEvent(data: Record<string, unknown>) {
    console.log(`>>> Write event.`);
  }
}
