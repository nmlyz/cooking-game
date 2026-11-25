// The screenshot scenes behind ?shot=start|play|serve|end. Each one sets the
// real world to a state a short game really reaches — orders on the board, a
// dish mid-assembly, a patty on the grill, a plate ready to serve — then the
// real renderer paints it twice and sets window.__shotReady for a screenshot.
// The same seed always gives the same frame.
import { DISHES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Set `world` to the named scene and return the screen to draw over it and
 * the best score to show. Names: start, play, serve, end (anything else
 * is start).
 */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    // Title over a quiet kitchen with two orders already on the board.
    world.startShift();
    state.screen = 'title';
    state.elapsed = 0;
    state.timeLeft = 180;
    return { screen: SCREEN_TITLE, best: 214 };
  }
  if (name === 'end') {
    world.startShift();
    state.screen = 'over';
    state.elapsed = 180;
    state.timeLeft = 0;
    state.coins = 214;
    state.served = 12;
    state.walkouts = 1;
    state.combo = 0;
    state.stars = 3;
    state.overReason = 'Shift over!';
    state.servedDishes = ['burger', 'ramen', 'salad', 'cheeseburger'];
    return { screen: SCREEN_OVER, best: 214 };
  }

  world.startShift();
  state.screen = 'play';
  if (name === 'play') {
    // Mid-rush: 2:14 left, 46 coins, burger half-built on plate 1, a patty
    // sizzling on the grill, noodles boiling, three tickets waiting.
    state.elapsed = 46;
    state.timeLeft = 134;
    state.coins = 46;
    state.served = 3;
    state.combo = 2;
    state.comboTimer = 12;
    state.orders = [
      { id: 3, dish: 'burger', patience: 38, maxPatience: 55, reward: 18 },
      { id: 4, dish: 'ramen', patience: 24, maxPatience: 55, reward: 20 },
      { id: 5, dish: 'salad', patience: 47, maxPatience: 55, reward: 14 },
    ];
    state.grill = [{ item: 'patty', t: 4.2 }, null];
    state.pot = { item: 'noodle', t: 3.1 };
    state.plates = [{ items: ['bun', 'patty_cooked', 'lettuce_chopped'] }, { items: [] }];
    state.hand = 'tomato_chopped';
    state.chef.x = 780;
    state.chef.targetX = 780;
    state.chef.facing = 1;
    state.hint = 'Stack the tomato, then ring the bell!';
    state.hintTimer = 30;
    state.servedDishes = ['burger', 'salad'];
    return { screen: SCREEN_PLAY, best: 214 };
  }
  // serve: a finished cheese burger on plate 1 matches ticket #6, the bell
  // glows, the chef waits at the pass with an egg in hand.
  state.elapsed = 78;
  state.timeLeft = 102;
  state.coins = 96;
  state.served = 6;
  state.combo = 3;
  state.comboTimer = 15;
  state.orders = [
    { id: 6, dish: 'cheeseburger', patience: 41, maxPatience: 55, reward: 22 },
    { id: 7, dish: 'burger', patience: 18, maxPatience: 55, reward: 18 },
    { id: 8, dish: 'ramen', patience: 50, maxPatience: 55, reward: 20 },
  ];
  state.grill = [{ item: 'patty', t: 6.4 }, null];
  state.chopping = { item: 'egg', t: 0.9 };
  state.plates = [
    { items: ['bun', 'patty_cooked', 'cheese', 'tomato_chopped'] },
    { items: ['noodle_cooked', 'broth'] },
  ];
  state.hand = null;
  state.chef.x = 1090;
  state.chef.targetX = 1090;
  state.chef.facing = 1;
  state.bellGlow = 0.9;
  state.hint = 'Cheese Burger is ready — ring the bell!';
  state.hintTimer = 30;
  state.servedDishes = ['burger', 'ramen', 'salad'];
  return { screen: SCREEN_PLAY, best: 214 };
}

export { DISHES };
