import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import Product from '../model/Product';
import { JwtAuthGuard } from '../auth/JwtAuthGuard';
import WebsocketGateway from './WebsocketGateway';

@Controller()
export class ProductController {
  constructor(
    @Inject('PRODUCT_SERVER') private readonly client: ClientProxy,
    private readonly websocket: WebsocketGateway,
  ) {}

  @Get()
  mainPage(): string {
    return (
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">\n' +
      "<div class='container display-1 text-center mt-5'>Products store</div>"
    );
  }

  @Get('home')
  homePage(): any {
    return {
      title: 'Product store',
    };
  }

  @Get('products')
  getProduct(): Observable<Product[]> {
    console.log('> GET /products');
    this.client.emit('read-event', { type: 'sync' });

    const pattern = { cmd: 'get-all' };
    return this.client.send<Product[]>(pattern, {});
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  addProduct(@Body() product: Product): Observable<Product> {
    console.log(`> POST /products {${product.name}}`);
    this.client.emit('write-event', { type: 'sync' });

    const pattern = { cmd: 'add' };
    const productObservable = this.client.send<Product>(pattern, product);

    this.websocket.sendWriteEvent('addProduct');
    return productObservable;
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(@Param('id') productId: number): Observable<Product> {
    console.log(`> DELETE /products/${productId}`);
    this.client.emit('write-event', { type: 'sync' });

    const pattern = { cmd: 'delete' };
    const productObservable = this.client.send<Product>(pattern, productId);

    this.websocket.sendWriteEvent('deleteProduct');
    return productObservable;
  }
}
