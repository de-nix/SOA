# SOA

### Application architecture

![My Image](app_diagram.png)
### APIs

* http://localhost:3001 - main server of the application. It provides api endpoint for crud operations for the Product
  entity
    * @Get('products') getProduct()
    * @Post('products') @UseGuards(JwtAuthGuard) addProduct(@Body() product: Product)
    * @Delete('products/:id') @UseGuards(JwtAuthGuard) deleteProduct(@Param('id') productId: number)
    * @Get('cart/:username') @UseGuards(JwtAuthGuard) getCart(@Param('username') username: string)
    * @Post('cart/:username') @UseGuards(JwtAuthGuard) addToCart(@Param('username') username: string, @Body() product:
      Product)
    * @Delete('cart/:username') @UseGuards(JwtAuthGuard) removeFromCart(@Param('username') username: string,@Body()
      product: Product)
* http://localhost:3002 - main in-memory storage for the products of the application. It is used by the main server to
  store/alter/retrieve data
* http://localhost:5001 - main entry for the microfrontends. It contains the authentication part and the navigation
    * exposes {} remotes{Products from http://localhost:5000 and ShoppingCart form http://localhost:5002}
* http://localhost:5000 - microfrontend that handles the display and the crd of products
    * exposes {Products} remotes{}
* http://localhost:5002 - microfrontend that handles the display and the rd of cart products
    * exposes {ShoppingCart} remotes{}

### Docker

Each microservice/microfrontend is running inside a docker container. The instructions for building a container can be
found in the docker-compose.yaml files from each service directory: docker-compose.yaml exposes a port for each
container and give them a name and the actual steps: copying the folder package.json and folder contents, npm install
and npm run build:dev are found in the Dockerfile

### MicroFrontends - ModuleFederationPlugin

ModuleFederationPlugin was used in order to share components between microfrontends. The info regarding the
microfrontend name, what it exposes and what it uses from remote can be configured in the webpack.config.js file from
each service folder

### MicroServices - nestjs

NestFactory from nestjs was used on the backend part to create microservices. In the main.ts file the microservice
configuration was defined: <br/>eg. { transport: Transport.TCP, options: { host: '0.0.0.0', port: 3002, retryAttempts:
5}

### 3rd Party App - Firebase

Firebase was used as a database for the cart items. After passing the connection json to the Firebase ex. {credential:
admin.credential.cert(serviceAccountJson as ServiceAccount)}, the response db component is stored and used to store and
get cart information: <br/>

eg. <br/>
this.db = admin.firestore(); <br/>
const docRef = this.db.collection('carts').doc(username);<br/>
await docRef.set(JSON.parse(JSON.stringify(cart)));<br/>

### Messaging Layer - WebSockets from @nestjs

On backend the main server is sending messages via a WebSocket that are received by the frontends by using
socket.io-client library which connects to the nestjs WebSocket <br/>

eg. <br/>
`server:`
<br/> @WebSocketServer() wss: Server;
<br/>this.wss.emit('write-event', message);
<br/> `clinet:`
<br/>const socket = io(API_URL, {autoConnect: true});
<br/>socket.on('write-event', (data: any) => { <br/>
&nbsp;&nbsp;&nbsp;&nbsp;console.log('WebSocket write-event ${data}');<br/>
&nbsp;&nbsp;&nbsp;&nbsp;handleGetAllProducts();<br/>
})


### System diagram
```mermaid
graph TD
    User([User])-.-uses-.->WebApplication(React Web Application)
    WebApplication-.->HttpServer(NestJS HTTP Server)
    HttpServer-.->Microservice(NestJS Microservice)
    HttpServer-.->GoogleCloudFirestore(Google Cloud Firestore)
    HttpServer-.-sends-.->WebApplication
```

### Component diagram
```mermaid
graph TD
    Client-->App
    App-->AppController
    App-->ProductController
    App-->FirebaseCartController
    AuthController-->AuthService
    AuthService-->UsersService
    AuthService-->JwtService
    ProductController-->NestJsMicroservice
    FirebaseCartController-->GoogleCloudFirestore
    subgraph web
        App
    end
    subgraph HTTP Server
        ProductController
        FirebaseCartController
        AppController
    end
    subgraph Product 
       NestJsMicroservice 
    end
    subgraph Cart
        GoogleCloudFirestore
    end
    subgraph Client Base
        AuthService
        UsersService
        JwtService
    end
```


### Code diagram
```mermaid
classDiagram
NestJS Microservice
    class Product {
        + id: number
        + name: string
        + price: number
        + Product()
    }
    
    class ProductService_MICRO {
        - lastId: number
        - Products: Product[]
        + getAll():
        + add()
        + delete()
     }
     ProductService_MICRO --> Product
     
     class AppController_MICRO {
        - ProductService: ProductService_MICRO
        + getProducts()
        + addProduct()
        + deleteProduct()
        + handleReadEvent()
        + handleWriteEvent()
     }
    AppController_MICRO --> ProductService_MICRO
    
NestJS HTTP Server
    class Cart {
        + username: string
        + Products: Product[]
    }
    Cart *-- Product
    
    class WebsocketGateway_SERVER {
        - wss: Server
        + sendWriteEvent()
        + handleEvent()
    }
    WebsocketGateway_SERVER<-->SocketIo
    
    class ProductController_SERVER {
        - client: ClientProxy
        + mainPage()
        + getProducts()
        + addProduct()
        + deleteProduct()
    }
    ProductController_SERVER --> Product
    ProductController_SERVER --> ClientProxy
    ProductController_SERVER --> WebsocketGateway_SERVER
    ClientProxy --> AppController_MICRO
    
    class FirebaseCartController_SERVER {
        - db: Firestore
        + getCart()
        + addToCart()
        + removeFromCart()
    }
    FirebaseCartController_SERVER --> Product
    FirebaseCartController_SERVER --> Cart
    FirebaseCartController_SERVER --> Firestore
    
    class User {
        + id: number
        + username: string
        + password: string
        + User()
    }
    
    class UserService_SERVER {
        - users: User[]
        + findOne()
    }
    UserService_SERVER --> User
    
    class AuthService_SERVER {
        - usersService: UserService_SERVER
        - jwtService: JwtService
        + login()
        + validateUser()
    }
    AuthService_SERVER --> UserService_SERVER
    AuthService_SERVER --> JwtService
    
    class AppController_SERVER {
        - authService: AuthService_SERVER
        + login()
    }
    AppController_SERVER --> AuthService_SERVER
    
React Web Application
    class AuthService_WEB {
        + setLoggedUser()
        + getUsername()
        + getJwt()
    }
    AuthService_WEB --> AppController_SERVER
    
    class NavigationBar_WEB {
        - authService: AuthService_WEB
        Login()
        Logout()
    }
    NavigationBar_WEB --> AuthService_WEB
    
    class App_WEB {
        GetAllProducts()
        AddProducts()
        DeleteProduct()
        GetCart()
        AddToCart()
        RemoveFromCart()
    }
    App_WEB --> Product
    App_WEB *-- NavigationBar_WEB
    App_WEB --> AuthService_WEB
    App_WEB --> ProductController_SERVER
    App_WEB --> FirebaseCartController_SERVER
    App_WEB <--> SocketIo
```