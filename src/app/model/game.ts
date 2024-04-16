export interface Chat {
  player1: string[],
  player2: string[]
}

export class GuessChatRequest {
  constructor(public playerId: string, public gameId: string, public wordDescription: string) {}
}
