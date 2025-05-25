import { Ship } from '../scripts/core/ship.js';

test('Length test', () => {
  expect(new Ship(5).length).toEqual(5);
});

test('Sunk test', () => {
  const ship = new Ship(2);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toEqual(true);
});
