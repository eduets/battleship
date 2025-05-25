import { Player } from '../scripts/core/player.js';

test('Is real test', () => {
  expect(new Player(true).isRealPlayer).toEqual(true);
});

test('Has gameboard test', () => {
  expect(new Player(false).gameboard).toBeDefined();
});
