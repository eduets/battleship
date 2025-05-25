import { Gameboard } from '../scripts/core/gameboard.js';

test('Has board test', () => {
  expect(new Gameboard().board).toBeDefined();
});

test('Has board length test', () => {
  expect(new Gameboard().board.length).toBeGreaterThan(0);
});

test('Ships not sunk test', () => {
  expect(new Gameboard().areAllShipsSunk()).toBe(false);
});

test('Missed attacks test', () => {
  const gameboard = new Gameboard();
  gameboard.missedAttack();
  gameboard.missedAttack();
  expect(gameboard.missedAttacks).toBe(2);
});
