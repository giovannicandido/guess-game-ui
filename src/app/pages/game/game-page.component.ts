import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Chat, GuessChatRequest } from "../../model/game";
import { environment } from "../../../environments/environment";
import { RxStomp, RxStompState } from "@stomp/rx-stomp";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";

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
  private rxStomp: RxStomp

  connected = false;

  roundFinished = false

  newGuessWord = ""

  subscriptions: Subscription[] = []
// {
//   "guessWord": "aba",
//   "gameID": "game1",
//   "timeDuration": "PT5M",
//   "numberOfRounds": 2,
//   "currentRoundNumber": 2,
//   "playerIDs": [
//     "aeb9cfac-340b-4300-9c3e-2c7110311ced",
//     "8cb84bb7-9a97-4d58-91bc-354b3668a97a"
//   ],
//   "score": {
//     "ia": 0,
//     "playerScores": {
//       "8cb84bb7-9a97-4d58-91bc-354b3668a97a": 0,
//       "aeb9cfac-340b-4300-9c3e-2c7110311ced": 1
//     }
//   }
// }
  gameDetails = {
    currentRoundNumber: 1,
    guessWord: "",
    timeDuration: "PT5M",
    numberOfRounds: 1,
    score: {
      ia: 0,
      playerScores: {
        PLAYER_1_ID: 0,
        PLAYER_2_ID: 0
      }
    }
  }

  guessess = {
    player1: "",
    player2: ""
  }

  chats: Chat = {
    player1: [],
    player2: [],
  }

  messagePlayer1 = "";
  messagePlayer2 = "";

  constructor(private activeRouter: ActivatedRoute, private toastr: ToastrService, private http: HttpClient) {
    this.gameId = activeRouter.snapshot.params['gameID']

    this.rxStomp = new RxStomp();
    this.rxStomp.configure({
      brokerURL: `${environment.BACKEND_WS}/api/game-ws`,
    });
  }

  ngOnInit() {
    if (!this.checkGameId()) {
      return
    }
    // this.initiateStompConnection()
    this.initRxStompConnection()
    this.loadCurrentGameDetails()
    this.loadChatHistory()
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
      console.log(`websocket change state: ${state}`);
      switch (state) {
        case RxStompState.CLOSED:
          this.connected = false
          break
      }
    })

    const sub4 = this.rxStomp.webSocketErrors$.subscribe(error => {
      console.error(error);
    })

    this.rxStomp.activate()

    const sub5 = this.rxStomp
      .watch({destination: `/games/chats/${this.gameId}`})
      .subscribe((message) => this.onNewChatMessage(message.body));

    const sub6 = this.rxStomp
      .watch({destination: `/games/updates/ia-guess/${this.gameId}`})
      .subscribe(message => this.onGuessGameMessage(message.body));

    const sub7 = this.rxStomp
      .watch({destination: `/games/updates/win/${this.gameId}`})
      .subscribe(message => this.onGameWin(message.body));

    const sub8 = this.rxStomp
      .watch({destination: `/games/updates/new-round/${this.gameId}`})
      .subscribe(message => this.onNewGame(message.body));
    const sub9 = this.rxStomp
      .watch({destination: `/games/updates/error`})
      .subscribe(message => this.onWebsocketErrorMessage(message.body))

    this.subscriptions.push(sub1)
    this.subscriptions.push(sub2)
    this.subscriptions.push(sub3)
    this.subscriptions.push(sub4)
    this.subscriptions.push(sub5)
    this.subscriptions.push(sub6)
    this.subscriptions.push(sub7)
    this.subscriptions.push(sub8)
    this.subscriptions.push(sub9)
  }

  onNewChatMessage(messageString: string) {
    const message = JSON.parse(messageString);
    if (message.userId === PLAYER_1_ID) {
      this.chats.player1.push(message.message)
      this.scrollMessage('player1-messages')
    } else if (message.userId === PLAYER_2_ID) {
      this.chats.player2.push(message.message)
      this.scrollMessage('player2-messages')
    }
    console.log(message);
  }

  onGuessGameMessage(messageString: string) {
    console.log('Guess game')
    const guess = JSON.parse(messageString);
    console.log(guess);
    if (guess.playerId === PLAYER_1_ID) {
      this.guessess.player1 = guess.guess;
    } else if (guess.playerId === PLAYER_2_ID) {
      this.guessess.player2 = guess.guess;
    }
  }

  async disconnect() {
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
    this.rxStomp.publish({
        destination: `/app/games/chats/${this.gameId}`,
        body: JSON.stringify(chatRequest)
      }
    )
  }

  scrollMessage(chatId: string) {
    setInterval(() => {
      const element = document.getElementById(chatId)
      if (element !== null) {
        element.scrollTop = element.scrollHeight
      }
    }, 300)

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

  private onGameWin(body: string) {
    console.log('Game Win Event')
    const message = JSON.parse(body);
    console.log(message)
    this.roundFinished = true
    if (message.winner === PLAYER_1_ID) {
      this.gameDetails.score.playerScores[PLAYER_1_ID] = message.score;
      this.toastr.success(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Parabéns! Player 1 ganhou o jogo!</span>',
        "",
        {
          timeOut: 4000,
          enableHtml: true,
          closeButton: true,
          toastClass: "alert alert-success alert-with-icon",
        }
      );
    } else if (message.winner === PLAYER_2_ID) {
      this.gameDetails.score.playerScores[PLAYER_2_ID] = message.score;
      this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Player 2 ganhou o jogo!</span>',
        "",
        {
          timeOut: 4000,
          enableHtml: true,
          closeButton: true,
          toastClass: "alert alert-info alert-with-icon",
        }
      );
    } else {
      this.gameDetails.score.ia = message.score;
      this.toastr.warning(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">O jogo terminou em empate ponto para IA!</span>',
        "",
        {
          timeOut: 4000,
          enableHtml: true,
          closeButton: true,
          toastClass: "alert alert-warning alert-with-icon",
        }
      );
    }
  }

  private onNewGame(body: string) {
    const message = JSON.parse(body);
    console.log(message)
    this.gameDetails = message.gameDetails;
    this.roundFinished = false
    this.chats.player1 = []
    this.chats.player2 = []
  }

  private onWebsocketErrorMessage(body: string) {
    const message = JSON.parse(body);
    console.log(message)
    this.toastr.error(
      `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Ocorreu um erro no servidor: <b>${message.errorMessage}</b></span>`,
      "",
      {
        timeOut: 4000,
        enableHtml: true,
        closeButton: true,
        toastClass: "alert alert-warning alert-with-icon",
      }
    );
  }

  starNewRound() {
    if (!this.validMessage(this.newGuessWord)) {
      return;
    }

    this.http.post(`${environment.BACKEND_URL}/api/v0/games/${this.gameId}/actions/start-round`, {guessWord: this.newGuessWord})
      .subscribe()

  }

  protected readonly PLAYER_1_ID = PLAYER_1_ID;
  protected readonly PLAYER_2_ID = PLAYER_2_ID;

  private loadCurrentGameDetails() {
    this.http.get<any>(`${environment.BACKEND_URL}/api/v0/games/${this.gameId}`)
      .subscribe(value => {
        console.log('load game details')
        console.log(value)
        this.gameDetails = value
      })
  }

  private loadChatHistory() {
    this.http.get<any[]>(`${environment.BACKEND_URL}/api/v0/games/${this.gameId}/chats`)
      .subscribe((chats ) => {
        this.chats.player1 = chats.find(c => c.playerId === PLAYER_1_ID)?.messages
        this.chats.player2 = chats.find(c => c.playerId === PLAYER_2_ID)?.messages
      });
  }
}
