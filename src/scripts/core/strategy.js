export { Strategy };

class Strategy {
  squares = [];
  coords = [];

  constructor() {}

  add(square, coords) {
    this.squares.push(square);
    this.coords.push(coords);
  }
}
