import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccountJson from '../configuration/product.json';
import _firestore from '@google-cloud/firestore';
import { ServiceAccount } from 'firebase-admin/lib/credential';
import Product from '../model/Product';
import Cart from '../model/Cart';
import { JwtAuthGuard } from '../auth/JwtAuthGuard';

@Controller()
export class FirebaseCartController {
  private db: _firestore.Firestore;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson as ServiceAccount),
    });

    this.db = admin.firestore();
    console.log('Firebase is up.');
  }

  @Get('cart/:username')
  @UseGuards(JwtAuthGuard)
  async getCart(@Param('username') username: string): Promise<Cart> {
    console.log(`> GET /cart/{${username}}`);
    return this.getCartFromFirebase(username);
  }

  private async getCartFromFirebase(username: string): Promise<Cart> {
    const snapshot = await this.db.collection('carts').get();

    for (const doc of snapshot.docs) {
      if (doc.id == username) {
        return doc.data() as Cart;
      }
    }

    return new Cart(username, []);
  }

  @Post('cart/:username')
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Param('username') username: string,
    @Body() product: Product,
  ): Promise<number> {
    console.log(`> POST /cart/${username} add {${product.id}}`);

    const cart: Cart = await this.getCartFromFirebase(username);
    cart.products.push(product);

    const docRef = this.db.collection('carts').doc(username);
    await docRef.set(JSON.parse(JSON.stringify(cart)));
    return cart.products.length;
  }

  @Delete('cart/:username')
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @Param('username') username: string,
    @Body() product: Product,
  ): Promise<number> {
    console.log(`> DELETE /cart/${username} remove {${product.id}}`);

    const cart: Cart = await this.getCartFromFirebase(username);

    const index = cart.products.findIndex(
      (fireBaseProduct) => fireBaseProduct.id == product.id,
    );
    if (index < 0) {
      return cart.products.length;
    }
    cart.products.splice(index, 1);

    const docRef = this.db.collection('carts').doc(username);
    await docRef.set(JSON.parse(JSON.stringify(cart)));
    return cart.products.length;
  }
}
