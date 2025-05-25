export { Gameboard };
import { Ship } from './ship.js';
import { Square } from './square.js';
import { EventBus } from '../utils/event-bus.js';

class Gameboard {
  #missedAttacks = 0;
  #shipsLengths = [5, 4, 3, 3, 2];
  #ships = [];
  board = [];
  eventBus = new EventBus();

  constructor() {
    // Create ships
    for (const shipLength of this.#shipsLengths) {
      this.#ships.push(new Ship(shipLength));
    }
    // Build board
    this.buildBoard();
  }

  buildBoard() {
    this.unsink();
    this.board = [];
    for (let i = 0; i < 10; i++) {
      this.board.push([]);
      for (let j = 0; j < 10; j++) {
        this.board[i].push(new Square());
      }
    }
    // Place ships
    this.placeRandomShips();
  }

  placeRandomShips() {
    for (const ship of this.#ships) {
      let placedShip = false;
      outer: while (!placedShip) {
        const randomCoords = [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ];
        const randomDirection = [Math.random() < 0.5 ? 0 : 1, 0];
        if (randomDirection[0] !== 0) {
          randomDirection[0] = Math.random() < 0.5 ? -1 : 1;
        } else {
          randomDirection[1] = Math.random() < 0.5 ? -1 : 1;
        }
        for (let i = 0; i < ship.length; i++) {
          const targetCoords = [
            randomCoords[0] + i * randomDirection[0],
            randomCoords[1] + i * randomDirection[1]
          ];

          if (
            targetCoords[0] < 0 ||
            targetCoords[0] > 9 ||
            targetCoords[1] < 0 ||
            targetCoords[1] > 9
          ) {
            continue outer;
          }
          if (this.board[targetCoords[0]][targetCoords[1]].ship !== null) {
            continue outer;
          }
        }
        for (let i = 0; i < ship.length; i++) {
          const targetCoords = [
            randomCoords[0] + i * randomDirection[0],
            randomCoords[1] + i * randomDirection[1]
          ];
          this.board[targetCoords[0]][targetCoords[1]].ship = ship;
        }
        placedShip = true;
      }
    }
  }

  receiveAttack(x, y) {
    if (!this.board[x][y].isHit) {
      this.board[x][y].hit();
      if (this.board[x][y].ship !== null) {
        // Hit
        const isSunk = this.board[x][y].ship.isSunk();
        return this.board[x][y].ship;
      } else {
        // Miss
        this.missedAttack();
        return null;
      }
    }
  }

  missedAttack() {
    this.#missedAttacks += 1;
  }

  get missedAttacks() {
    return this.#missedAttacks;
  }

  areAllShipsSunk() {
    let areAllSunk = true;
    for (const ship of this.#ships) {
      if (!ship.isSunk()) {
        areAllSunk = false;
        break;
      }
    }
    return areAllSunk;
  }

  getSquare(coords) {
    return this.board[coords[0]][coords[1]];
  }

  unsink() {
    for (const ship of this.#ships) {
      ship.resetHits();
    }
  }
}
