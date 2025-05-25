export { DOMHandler };
import { EventBus } from '../utils/event-bus.js';
import boardHtml from '../../html/board.html';
import infoOptionsHtml from '../../html/info-options.html';
import graveyardHtml from '../../html/graveyard.html';

class DOMHandler {
  static #doc;
  static #boardsElement;
  static #boardTemplate;
  static #infoOptionsTemplate;
  static #infoOptions;
  static boardSelf;
  static boardEnemy;
  static #graveyardTemplate;
  static #graveyardSelf;
  static #graveyardEnemy;
  static #randomizeButton;
  static startButton;
  static #message;
  static eventBus = new EventBus();
  static EVENTS = {
    BOARD_CLICKED: 'boardClicked',
    RANDOMIZE: 'randomize',
    START: 'start'
  };

  static initialize(doc) {
    this.#doc = doc;
    this.#boardsElement = this.#doc.querySelector('.boards');
    this.#boardTemplate = this.#createFromTemplate(boardHtml);
    this.#infoOptionsTemplate = this.#createFromTemplate(infoOptionsHtml);

    this.boardSelf = this.#boardTemplate.cloneNode(true).firstElementChild;
    this.boardSelf.classList.add('self');
    this.#boardsElement.appendChild(this.boardSelf);

    this.#graveyardTemplate = this.#createFromTemplate(graveyardHtml);
    this.#graveyardSelf =
      this.#graveyardTemplate.cloneNode(true).firstElementChild;
    this.#boardsElement.appendChild(this.#graveyardSelf);

    this.#infoOptions =
      this.#infoOptionsTemplate.cloneNode(true).firstElementChild;
    this.#boardsElement.appendChild(this.#infoOptions);

    this.#graveyardTemplate = this.#createFromTemplate(graveyardHtml);
    this.#graveyardEnemy =
      this.#graveyardTemplate.cloneNode(true).firstElementChild;
    this.#boardsElement.appendChild(this.#graveyardEnemy);

    this.boardEnemy = this.#boardTemplate.cloneNode(true).firstElementChild;
    this.boardEnemy.classList.add('enemy');
    this.#boardsElement.appendChild(this.boardEnemy);

    this.#message = this.#doc.querySelector('.message');

    this.#randomizeButton = this.#doc.querySelector('#randomize-button');
    this.startButton = this.#doc.querySelector('#start-button');
    this.#randomizeButton.addEventListener('click', (event) => {
      this.eventBus.emit(this.EVENTS.RANDOMIZE);
    });
    this.startButton.addEventListener('click', (event) => {
      this.eventBus.emit(this.EVENTS.START);
    });

    for (const squareElement of this.boardEnemy.children) {
      squareElement.classList.add('undiscovered');
    }
    // this.setClickable(this.boardEnemy);
    this.setUnclickable(this.boardEnemy);
  }

  static #createFromTemplate(importedTemplate) {
    const template = this.#doc.createElement('template');
    template.innerHTML = importedTemplate.trim();
    return template.content;
  }

  static setClickable(board) {
    board.addEventListener('click', DOMHandler.boardClicked, { capture: true });
    board.classList.remove('unclickable');
  }

  static setUnclickable(board) {
    board.removeEventListener('click', DOMHandler.boardClicked, {
      capture: true
    });
    board.classList.add('unclickable');
  }

  static boardClicked(event) {
    if (event.target !== DOMHandler.boardEnemy) {
      if (!event.target.classList.contains('undiscovered')) {
        return;
      }

      const index = Array.from(DOMHandler.boardEnemy.children).indexOf(
        event.target
      );
      event.target.classList.remove('undiscovered');
      const x = Math.floor(index / 10);
      const y = index % 10;
      DOMHandler.eventBus.emit(
        DOMHandler.EVENTS.BOARD_CLICKED,
        x,
        y,
        event.target
      );
    }
  }

  static setSquareHit(squareElement) {
    squareElement.classList.add('hit');
  }

  static setSquareMiss(squareElement) {
    squareElement.classList.add('miss');
  }

  static renderShips(boardElement, board) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const square = board[i][j];
        const index = i * 10 + j;
        boardElement.children[index].classList.remove('ship');
        boardElement.children[index].classList.remove('curve-left');
        boardElement.children[index].classList.remove('curve-right');
        boardElement.children[index].classList.remove('curve-top');
        boardElement.children[index].classList.remove('curve-bottom');
        if (square.ship !== null) {
          boardElement.children[index].classList.add('ship');
          this.manageAdjacency(square, board, boardElement, index, i, j);
        }
      }
    }
  }

  static manageAdjacency(square, board, boardElement, index, x, y) {
    const coordsUp = [x, y - 1];
    const coordsRight = [x + 1, y];
    const coordsDown = [x, y + 1];
    const coordsLeft = [x - 1, y];
    const coords = [coordsUp, coordsRight, coordsDown, coordsLeft];
    let adjacency = 0;
    let upAdjacency = false;
    let rightAdjacency = false;
    let downAdjacency = false;
    let leftAdjacency = false;
    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      if (coord[0] >= 0 && coord[0] < 10 && coord[1] >= 0 && coord[1] < 10) {
        if (board[coord[0]][coord[1]].ship === square.ship) {
          adjacency += 1;
          if (i === 0) {
            upAdjacency = true;
          } else if (i === 1) {
            rightAdjacency = true;
          } else if (i === 2) {
            downAdjacency = true;
          } else if (i === 3) {
            leftAdjacency = true;
          }
        }
      }
    }
    if (adjacency === 1) {
      if (upAdjacency) {
        boardElement.children[index].classList.add('curve-bottom');
      } else if (rightAdjacency) {
        boardElement.children[index].classList.add('curve-left');
      } else if (downAdjacency) {
        boardElement.children[index].classList.add('curve-top');
      } else if (leftAdjacency) {
        boardElement.children[index].classList.add('curve-right');
      }
    }
  }

  static getSelfSquareElement(x, y) {
    const index = x * 10 + y;
    const selfSquareElement = this.boardSelf.children[index];
    return selfSquareElement;
  }

  static showGraveyards() {
    const graveyards = this.#doc.querySelectorAll('.graveyard');
    for (const graveyard of graveyards) {
      graveyard.classList.remove('hidden');
    }
  }

  static hideGraveyards() {
    const graveyards = this.#doc.querySelectorAll('.graveyard');
    for (const graveyard of graveyards) {
      graveyard.classList.add('hidden');
    }
  }

  static showRandomize() {
    this.#randomizeButton.classList.remove('hidden');
  }

  static hideRandomize() {
    this.#randomizeButton.classList.add('hidden');
  }

  static showInfoOptions() {
    this.#infoOptions.classList.remove('hidden');
  }

  static hideInfoOptions() {
    this.#infoOptions.classList.add('hidden');
  }

  static setContinueText() {
    this.startButton.textContent = 'CONTINUE';
  }

  static setStartText() {
    this.startButton.textContent = 'START';
  }

  static sunkShip(ship, graveyard) {
    const tombs = graveyard.querySelectorAll(`[data-length="${ship.length}"]`);
    let indexToSink = 0;
    if (tombs[0].classList.contains('sunk')) {
      indexToSink = tombs.length - 1;
    }
    tombs[indexToSink].classList.add('sunk');
  }

  static sunkSelf(ship) {
    this.sunkShip(ship, this.#graveyardSelf);
  }

  static sunkEnemy(ship) {
    this.sunkShip(ship, this.#graveyardEnemy);
  }

  static showVictoryMessage() {
    this.#message.textContent = 'YOU WIN!';
    this.#message.classList.remove('hidden');
  }

  static showDefeatMessage() {
    this.#message.textContent = 'YOU LOSE!';
    this.#message.classList.remove('hidden');
  }

  static hideMessage() {
    this.#message.classList.add('hidden');
  }

  static clearBoard(board, undiscover) {
    for (let i = 0; i < board.children.length; i++) {
      board.children[i].classList.remove('ship');
      board.children[i].classList.remove('hit');
      board.children[i].classList.remove('miss');
      if (undiscover) {
        board.children[i].classList.add('undiscovered');
      }
    }
  }

  static clearBoards() {
    this.clearBoard(this.boardSelf, false);
    this.clearBoard(this.boardEnemy, true);
  }

  static clearGraveyard(graveyard) {
    for (let i = 0; i < graveyard.children.length; i++) {
      graveyard.children[i].classList.remove('sunk');
    }
  }

  static clearGraveyards() {
    this.clearGraveyard(this.#graveyardSelf);
    this.clearGraveyard(this.#graveyardEnemy);
  }
}
