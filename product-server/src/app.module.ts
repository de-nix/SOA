import { Module } from '@nestjs/common';
import { ProductController } from './controllers/ProductController';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserService } from './auth/user.service';
import { LocalStrategy } from './auth/LocalStrategy';
import { AuthService } from './auth/AuthService';
import { AppController } from './controllers/AppController';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/JwtStrategy';
import { FirebaseCartController } from './controllers/FirebaseCartController';
import WebsocketGateway from './controllers/WebsocketGateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVER',
        transport: Transport.TCP,
        options: {
          host: 'host.docker.internal', // if you run from Docker
          port: 3002,
        },
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'product',
      signOptions: { expiresIn: '10 days' },
    }),
  ],
  controllers: [AppController, ProductController, FirebaseCartController],
  providers: [
    UserService,
    AuthService,
    LocalStrategy,
    JwtModule,
    JwtStrategy,
    WebsocketGateway,
  ],
  exports: [UserService],
})
export class AppModule {}
