import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets/interfaces';
import { Socket, Server } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JWtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly  jwtService: JwtService
    ) {}
  async handleConnection( client: Socket ) {
    // console.log(`Cliente conectado: ${ client.id } `)

    const token = client.handshake.headers.authentification as string;
    let payload: JWtPayload;

    try{

      payload = this.jwtService.verify(token) as JWtPayload;

    } catch (error) {
      client.disconnect();
    }


    await this.messagesWsService.registerClient( client, payload.id );
    // console.log({ payload });

    console.log({ conectados: this.messagesWsService.getConnectedClients() });

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )

  }
  handleDisconnect(client: Socket) {
    // console.log(`Cliente desconectado: ${ client.id }`)
    this.messagesWsService.removeClient( client )

    console.log({ conectados: this.messagesWsService.getConnectedClients() });

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }


  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {


      //!Emite únicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message'
    // });


    //! Emitir a todos MENOS, al cliente inicial.
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message'
    // });

    //! Emitir a todos.
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload || 'no-message'
    });
  
  }

  

}
