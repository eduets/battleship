export { Main };
import { Ship } from './core/ship.js';
import { Gameboard } from './core/gameboard.js';
import { Player } from './core/player.js';
import { GameHandler } from './core/game-handler.js';
import { DOMHandler } from './dom/dom-handler.js';

class Main {
  static COMPUTER_REACTION_TIME = 500;

  static {
    this.#initialize();
  }

  static #initialize() {
    GameHandler.initialize(false);
    GameHandler.eventBus.on(GameHandler.EVENTS.GAME_OVER, Main.gameOver);
    DOMHandler.initialize(document);
    DOMHandler.eventBus.on(DOMHandler.EVENTS.BOARD_CLICKED, Main.boardClicked);
    DOMHandler.renderShips(
      DOMHandler.boardSelf,
      GameHandler.player1.gameboard.board
    );
    DOMHandler.eventBus.on(DOMHandler.EVENTS.RANDOMIZE, Main.randomize);
    DOMHandler.eventBus.on(DOMHandler.EVENTS.START, Main.start);
  }

  static gameOver() {
    DOMHandler.setUnclickable(DOMHandler.boardEnemy);
    DOMHandler.showInfoOptions();
    if (GameHandler.currentTurnPlayer === GameHandler.player1) {
      DOMHandler.showVictoryMessage();
    } else {
      DOMHandler.showDefeatMessage();
    }
    DOMHandler.hideRandomize();
    DOMHandler.setContinueText();
  }

  static boardClicked(x, y, squareElement) {
    let attackResult = null;
    attackResult = GameHandler.attack(x, y);
    if (attackResult !== null) {
      // Hit, repeat turn
      // Check if it's sunk
      if (attackResult.isSunk()) {
        DOMHandler.sunkEnemy(attackResult);
      }
      DOMHandler.setSquareHit(squareElement);
      return;
    } else {
      DOMHandler.setSquareMiss(squareElement);
    }
    DOMHandler.setUnclickable(DOMHandler.boardEnemy);

    setTimeout(Main.computerAttack, Main.COMPUTER_REACTION_TIME);
  }

  static computerAttack() {
    let computerAttackResult = null;
    const coords = GameHandler.getComputerSmartCoordinates();
    computerAttackResult = GameHandler.attack(...coords);
    const selfSquareElement = DOMHandler.getSelfSquareElement(...coords);
    if (computerAttackResult !== null) {
      DOMHandler.setSquareHit(selfSquareElement);
    } else {
      DOMHandler.setSquareMiss(selfSquareElement);
    }

    if (computerAttackResult !== null) {
      GameHandler.eventBus.emit(
        GameHandler.EVENTS.STRATEGIZE,
        GameHandler.player1.gameboard.getSquare(coords),
        coords
      );

      if (computerAttackResult.isSunk()) {
        GameHandler.analyzeStrategy(computerAttackResult);
        DOMHandler.sunkSelf(computerAttackResult);
      }

      if (!GameHandler.isGameOver) {
        setTimeout(Main.computerAttack, Main.COMPUTER_REACTION_TIME);
      }
    } else {
      if (!GameHandler.isGameOver) {
        DOMHandler.setClickable(DOMHandler.boardEnemy);
      }
    }
  }

  static randomize() {
    GameHandler.player1.gameboard.buildBoard();
    DOMHandler.renderShips(
      DOMHandler.boardSelf,
      GameHandler.player1.gameboard.board
    );
  }

  static start() {
    if (DOMHandler.startButton.textContent !== 'CONTINUE') {
      DOMHandler.setClickable(DOMHandler.boardEnemy);
      DOMHandler.showGraveyards();
      DOMHandler.hideInfoOptions();
      GameHandler.isGameOver = false;
    } else {
      DOMHandler.setStartText();
      DOMHandler.hideMessage();
      DOMHandler.showRandomize();
      DOMHandler.clearBoards();
      DOMHandler.clearGraveyards();
      DOMHandler.hideGraveyards();
      GameHandler.resetStrategy();
      GameHandler.setTurns();
      GameHandler.player1.gameboard.buildBoard();
      GameHandler.player2.gameboard.buildBoard();
      DOMHandler.renderShips(
        DOMHandler.boardSelf,
        GameHandler.player1.gameboard.board
      );
    }
  }
}
