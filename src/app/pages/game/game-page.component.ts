import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Chat, GuessChatRequest } from "../../model/game";
import { Client, Message, Stomp } from '@stomp/stompjs';
import { environment } from "../../../environments/environment";
import { RxStomp, RxStompState } from "@stomp/rx-stomp";
import { Subscription } from "rxjs";
import { error } from "@angular/compiler-cli/src/transformers/util";

// todo check https://www.baeldung.com/spring-websockets-send-message-to-user
const PLAYER_1_ID = "aeb9cfac-340b-4300-9c3e-2c7110311ced"
const PLAYER_2_ID = "8cb84bb7-9a97-4d58-91bc-354b3668a97a"
@Component({
  selector: 'app-game-page',
  styleUrls: ['./game-page.component.scss'],
  templateUrl: 'game-page.component.html'
})

export class GamePageComponent implements OnInit, OnDestroy {

  gameId: string;
  private stompClient: Client;
  private rxStomp: RxStomp

  connected = false;

  subscriptions: Subscription[] = []

  gameDetails = {
    roundNumber: 1,
    currentWord: "teste",
    score: {
      ia: 0,
      player1: 1,

      player2: 2,
    }
  }

  guessess = {
    player1: "pássaro",
    player2: "aviao"
  }

  chats: Chat = {
    player1: ["try 1", "try 2", "try 3"],
    player2: ["try 1", "try 2", "try 3"],
  }

  messagePlayer1 = "";
  messagePlayer2 = "";

  constructor(private activeRouter: ActivatedRoute, private toastr: ToastrService) {
    this.gameId = activeRouter.snapshot.params['gameID']
    function websocketFactory () {
      return new WebSocket(`${environment.BACKEND_WS}/game-ws`)
    }
    this.stompClient = Stomp.over(websocketFactory)

    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: `${environment.BACKEND_WS}/game-ws`,
    });
  }

  get chatPlayer1(): string {
    return this.chats.player1.join('\n');
  }

  get chatPlayer2(): string {
    return this.chats.player1.join('\n');
  }

  ngOnInit() {
    if (!this.checkGameId()) {
      return
    }
    // this.initiateStompConnection()
    this.initiateStompConnection()
  }

  async ngOnDestroy(): Promise<void> {
    await this.disconnect()
  }

  private checkGameId(): boolean {
    if (this.gameId === undefined) {
      this.toastr.error(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Id de Jogo é indefinido utilize a url /games/id-jogo</span>',
        "",
        {
          timeOut: 4000,
          enableHtml: true,
          closeButton: true,
          toastClass: "alert alert-danger alert-with-icon",
        }
      );
    }
    return this.gameId !== undefined
  }

  private initRxStompConnection() {
    const sub1 = this.rxStomp.connected$.subscribe(value => {
      this.connected = true
    })
    const sub2 = this.rxStomp.stompErrors$.subscribe(error => {
      console.error(error);
    })

    const sub3 = this.rxStomp.connectionState$.subscribe(state => {
      console.log(state);
      switch (state) {
        case RxStompState.CLOSED: this.connected = false
          break
      }
    })

    const sub4 = this.rxStomp.webSocketErrors$.subscribe(error => {
      console.error(error);
    })

    this.rxStomp.activate()

    const sub5 = this.rxStomp
      .watch({destination: `/chats/${this.gameId}`})
      .subscribe((message) => console.log(message.body));

    this.subscriptions.push(sub1)
    this.subscriptions.push(sub2)
    this.subscriptions.push(sub3)
    this.subscriptions.push(sub4)
    this.subscriptions.push(sub5)
  }

  private initiateStompConnection() {

    this.stompClient.onConnect = (frame) => {
      this.connected = true;
      console.log('Connected: ' + frame);
      this.stompClient.subscribe(`/games/chats/${this.gameId}`, (chat) => {
        console.log('Chat message received')
        this.onNewChatMessage(JSON.parse(chat.body));
      });
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('Error with websocket', error);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.onDisconnect = (frame) => {
      this.connected = false;
      console.error('Disconnected: ' + frame.body);
    };

    this.stompClient.activate()
    window['stompClient'] = this.stompClient;
  }

  onNewChatMessage(message: any) {
    console.log(message);
  }

  async disconnect() {
    await this.stompClient.deactivate();
    await this.rxStomp.deactivate();
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.connected = false;
    console.log("Disconnected");
  }

  sendTipMessage(player: "player1" | "player2") {
    if (player === "player1") {
      if (!this.validMessage(this.messagePlayer1)) {
        return;
      }
      this.publishTipMessage(PLAYER_1_ID, this.messagePlayer1)
      this.messagePlayer1 = ""
    } else {
      if (!this.validMessage(this.messagePlayer2)) {
        return;
      }
      this.publishTipMessage(PLAYER_2_ID, this.messagePlayer2)
      this.messagePlayer2 = ""
    }
  }

  publishTipMessage(playerId: string, message: string) {
    const chatRequest = new GuessChatRequest(playerId, this.gameId, message)
    // this.stompClient.publish({
    //   destination: `/app/chats/${this.gameId}`,
    //   body: JSON.stringify(chatRequest)
    // });
    this.stompClient.publish({
        destination: `/app/games/chats/${this.gameId}`,
        body: JSON.stringify(chatRequest)
      }
    )
  }

  validMessage(message: string) {
    const valid = message !== null && message !== undefined && message.length > 0;
    if (!valid) {
      this.toastr.error(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Mensagem não pode ser vazia</span>',
        "",
        {
          timeOut: 4000,
          enableHtml: true,
          closeButton: true,
          toastClass: "alert alert-danger alert-with-icon",
        }
      );
    }
    return valid;
  }

}
