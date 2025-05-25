export { Ship };

class Ship {
  length;
  #timesHit;

  constructor(length) {
    this.length = length;
    this.#timesHit = 0;
  }

  hit() {
    this.#timesHit += 1;
  }

  isSunk() {
    return this.#timesHit >= this.length ? true : false;
  }

  resetHits() {
    this.#timesHit = 0;
  }
}
