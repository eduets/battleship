export { Player };
import { Gameboard } from './gameboard.js';

class Player {
  isRealPlayer;
  gameboard;

  constructor(isRealPlayer) {
    this.isRealPlayer = isRealPlayer;
    this.gameboard = new Gameboard();
  }
}
