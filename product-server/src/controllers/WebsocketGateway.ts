import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway()
export default class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  wss: Server;
  private readonly logger: Logger = new Logger('WebSocket');

  afterInit(server: any): any {
    this.logger.log('WebSocket is on');
  }

  handleConnection(client: any, ...args: any[]): any {
    this.logger.log(`+ Connected ${client.id}`);
  }

  handleDisconnect(client: any): any {
    this.logger.log(`- Disconnected ${client.id}`);
  }

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    this.logger.log(`Received: ${data}`);
    return data;
  }

  sendWriteEvent(message: string) {
    this.wss.emit('write-event', message);
  }
}
