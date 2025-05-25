export { Square };

class Square {
  ship = null;
  isHit = false;

  constructor() {}

  hit() {
    this.isHit = true;
    if (this.ship !== null) {
      this.ship.hit();
    }
  }
}
