import Product from './Product';

export default class Cart {
  username: string;
  products: Product[];

  constructor(username: string, products: Product[]) {
    this.username = username;
    this.products = products;
  }
}
