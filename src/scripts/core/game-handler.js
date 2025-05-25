export { GameHandler };
import { Ship } from './ship.js';
import { Gameboard } from './gameboard.js';
import { Player } from './player.js';
import { EventBus } from '../utils/event-bus.js';
import { Strategy } from './strategy.js';

class GameHandler {
  static player1;
  static player2;
  static currentTurnPlayer;
  static currentDefendingPlayer;
  static eventBus = new EventBus();
  static EVENTS = {
    GAME_OVER: 'gameOver',
    STRATEGIZE: 'strategize'
  };
  static isGameOver = false;
  static #computerStrategy = null;

  static {}

  static initialize(isVsPlayer) {
    this.player1 = new Player(true);
    this.player2 = new Player(isVsPlayer);
    this.setTurns();
    GameHandler.eventBus.on(
      GameHandler.EVENTS.STRATEGIZE,
      GameHandler.strategize
    );
  }

  static setTurns() {
    this.currentTurnPlayer = this.player1;
    this.currentDefendingPlayer = this.player2;
  }

  static attack(x, y) {
    if (this.isGameOver) {
      return null;
    }

    const attackResult = this.currentDefendingPlayer.gameboard.receiveAttack(
      x,
      y
    );
    if (this.currentDefendingPlayer.gameboard.areAllShipsSunk()) {
      this.isGameOver = true;
      this.eventBus.emit(this.EVENTS.GAME_OVER);
      return attackResult;
    }

    if (attackResult === null) {
      if (this.currentTurnPlayer === this.player1) {
        this.currentTurnPlayer = this.player2;
        this.currentDefendingPlayer = this.player1;
      } else {
        this.currentTurnPlayer = this.player1;
        this.currentDefendingPlayer = this.player2;
      }
    }

    return attackResult;
  }

  static getComputerRandomAvailableCoordinates() {
    const player1Board = this.player1.gameboard.board;
    const availableCoordinates = [];
    for (let i = 0; i < player1Board.length; i++) {
      for (let j = 0; j < player1Board[i].length; j++) {
        if (!player1Board[i][j].isHit) {
          availableCoordinates.push([i, j]);
        }
      }
    }
    let randomCoordinate = null;
    if (availableCoordinates.length > 0) {
      randomCoordinate =
        availableCoordinates[
          Math.floor(Math.random() * availableCoordinates.length)
        ];
    }
    return randomCoordinate;
  }

  static strategize(square, coords) {
    if (GameHandler.#computerStrategy === null) {
      GameHandler.#computerStrategy = new Strategy();
    }
    GameHandler.#computerStrategy.add(square, coords);
  }

  static analyzeStrategy(sunkShip) {
    const newSquares = [];
    const newCoords = [];
    for (let i = 0; i < this.#computerStrategy.squares.length; i++) {
      if (this.#computerStrategy.squares[i].ship !== sunkShip) {
        newSquares.push(this.#computerStrategy.squares[i]);
        newCoords.push(this.#computerStrategy.coords[i]);
      }
    }
    this.#computerStrategy.squares = newSquares;
    this.#computerStrategy.coords = newCoords;
    if (this.#computerStrategy.squares.length === 0) {
      this.#computerStrategy = null;
    }
  }

  static getComputerSmartCoordinates() {
    if (this.#computerStrategy === null) {
      return this.getComputerRandomAvailableCoordinates();
    } else {
      const possibleAttacks = [];
      let coordsCandidates = [];
      if (this.#computerStrategy.squares.length === 1) {
        // Only one square in the strategy
        const squareCoords = this.#computerStrategy.coords[0];
        const coordUp = [squareCoords[0], squareCoords[1] - 1];
        const coordRight = [squareCoords[0] + 1, squareCoords[1]];
        const coordDown = [squareCoords[0], squareCoords[1] + 1];
        const coordLeft = [squareCoords[0] - 1, squareCoords[1]];
        coordsCandidates = [coordUp, coordRight, coordDown, coordLeft];
      } else {
        // Multiple squares in the strategy
        if (
          this.#computerStrategy.coords[0][0] ===
          this.#computerStrategy.coords[1][0]
        ) {
          // X coord is the same
          let minSingleCoord = this.#computerStrategy.coords[0][1];
          let maxSingleCoord = this.#computerStrategy.coords[0][1];
          for (let i = 1; i < this.#computerStrategy.coords.length; i++) {
            if (this.#computerStrategy.coords[i][1] < minSingleCoord) {
              minSingleCoord = this.#computerStrategy.coords[i][1];
            }
            if (this.#computerStrategy.coords[i][1] > maxSingleCoord) {
              maxSingleCoord = this.#computerStrategy.coords[i][1];
            }
          }
          coordsCandidates.push([
            this.#computerStrategy.coords[0][0],
            minSingleCoord - 1
          ]);
          coordsCandidates.push([
            this.#computerStrategy.coords[0][0],
            maxSingleCoord + 1
          ]);
        } else {
          // Y coord is the same
          let minSingleCoord = this.#computerStrategy.coords[0][0];
          let maxSingleCoord = this.#computerStrategy.coords[0][0];
          for (let i = 1; i < this.#computerStrategy.coords.length; i++) {
            if (this.#computerStrategy.coords[i][0] < minSingleCoord) {
              minSingleCoord = this.#computerStrategy.coords[i][0];
            }
            if (this.#computerStrategy.coords[i][0] > maxSingleCoord) {
              maxSingleCoord = this.#computerStrategy.coords[i][0];
            }
          }
          coordsCandidates.push([
            minSingleCoord - 1,
            this.#computerStrategy.coords[0][1]
          ]);
          coordsCandidates.push([
            maxSingleCoord + 1,
            this.#computerStrategy.coords[0][1]
          ]);
        }
      }

      for (const coordsCandidate of coordsCandidates) {
        if (
          coordsCandidate[0] >= 0 &&
          coordsCandidate[0] < 10 &&
          coordsCandidate[1] >= 0 &&
          coordsCandidate[1] < 10
        ) {
          const targetSquare =
            this.player1.gameboard.getSquare(coordsCandidate);
          if (!targetSquare.isHit) {
            possibleAttacks.push(coordsCandidate);
          }
        }
      }

      // TODO: si llega hasta aqui con possibleattacks vacio, buscar alrededor de cada square
      // como en only one square pero con todos, y elegir uno al azar de ellos
      if (possibleAttacks.length === 0) {
        coordsCandidates = [];
        for (let i = 1; i < this.#computerStrategy.coords.length; i++) {
          const squareCoords = this.#computerStrategy.coords[i];
          const coordUp = [squareCoords[0], squareCoords[1] - 1];
          const coordRight = [squareCoords[0] + 1, squareCoords[1]];
          const coordDown = [squareCoords[0], squareCoords[1] + 1];
          const coordLeft = [squareCoords[0] - 1, squareCoords[1]];
          coordsCandidates = coordsCandidates.concat([
            coordUp,
            coordRight,
            coordDown,
            coordLeft
          ]);
        }
        for (const coordsCandidate of coordsCandidates) {
          if (
            coordsCandidate[0] >= 0 &&
            coordsCandidate[0] < 10 &&
            coordsCandidate[1] >= 0 &&
            coordsCandidate[1] < 10
          ) {
            const targetSquare =
              this.player1.gameboard.getSquare(coordsCandidate);
            if (!targetSquare.isHit) {
              possibleAttacks.push(coordsCandidate);
            }
          }
        }
      }

      // Pick random attack of the possible attacks
      const randomAttack =
        possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)];
      return randomAttack;
    }
  }

  static unsink() {
    this.player1.gameboard.unsink();
    this.player2.gameboard.unsink();
  }

  static resetStrategy() {
    this.#computerStrategy = null;
  }
}
