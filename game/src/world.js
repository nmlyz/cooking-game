// The kitchen itself: orders, stations, the chef's hand and plates, the shift
// clock, coins and combos. Pure logic — no drawing, no sound — so the same
// rules drive the live game and the staged screenshot scenes.
import {
  BIN, CHEF, CHOP_SECONDS, COMBO_WINDOW, DISHES, DISH_ORDER, GRILL,
  INGREDIENTS, MAX_ORDERS, MAX_WALKOUTS, ORDER_PATIENCE, ORDER_SPAWN,
  POT, PREPARED, SHIFT_SECONDS, STATIONS,
} from './config.js';
import { pick } from './random.js';

export const EVENT_SERVED = 1;
export const EVENT_WALKOUT = 2;
export const EVENT_OVER = 4;
export const EVENT_GRILL_DONE = 8;
export const EVENT_BURNT = 16;
export const EVENT_CHOPPED = 32;
export const EVENT_ERROR = 64;
export const EVENT_POT_DONE = 128;

const INGREDIENT_KEYS = Object.keys(INGREDIENTS);

/** Which raw items can go straight onto a plate without a station step. */
function plateable(item) {
  if (item === 'bun' || item === 'cheese' || item === 'broth') return true;
  return item === 'patty_cooked' || item === 'lettuce_chopped' || item === 'tomato_chopped'
    || item === 'egg_chopped' || item === 'noodle_cooked';
}

/** What a plate still needs before it matches `dish`, as item ids. */
function missingFor(plate, dish) {
  return DISHES[dish].needs.filter((need) => !plate.items.includes(need));
}

function plateMatches(plate, dish) {
  const needs = DISHES[dish].needs;
  return plate.items.length === needs.length && needs.every((n) => plate.items.includes(n));
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      screen: 'title',
      elapsed: 0,
      timeLeft: SHIFT_SECONDS,
      coins: 0,
      served: 0,
      walkouts: 0,
      combo: 0,
      comboTimer: 0,
      orders: [],
      hand: null,
      grill: [null, null],
      pot: null,
      chopping: null,
      plates: [{ items: [] }, { items: [] }],
      chef: { x: 640, targetX: 640, facing: 1, bob: 0, walking: false },
      particles: [],
      floaters: [],
      hint: '',
      hintTimer: 0,
      shake: 0,
      bellGlow: 0,
      spawnTimer: 3,
      orderSeq: 0,
      chopTick: 0,
      lastTickSecond: -1,
      stars: 0,
      overReason: '',
      servedDishes: [],
    };
  }

  function say(text, seconds = 2.2) {
    state.hint = text;
    state.hintTimer = seconds;
  }

  function floater(x, y, text, color = '#ffd94d') {
    state.floaters.push({ x, y, text, color, life: 1.4 });
  }

  function steam(x, y) {
    state.particles.push({
      x: x + (random() - 0.5) * 30, y, vx: (random() - 0.5) * 8, vy: -26 - random() * 14,
      life: 0.9, maxLife: 0.9, size: 5 + random() * 5, kind: 'steam',
    });
  }

  function sparkle(x, y, color) {
    for (let i = 0; i < 10; i += 1) {
      state.particles.push({
        x, y, vx: (random() - 0.5) * 120, vy: -40 - random() * 90,
        life: 0.8, maxLife: 0.8, size: 3 + random() * 3, kind: 'spark', color,
      });
    }
  }

  function dishPool() {
    if (state.elapsed < 30) return ['burger', 'salad'];
    if (state.elapsed < 70) return ['burger', 'cheeseburger', 'salad'];
    return DISH_ORDER;
  }

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return;
    const dish = pick(random, dishPool());
    state.orderSeq += 1;
    state.orders.push({
      id: state.orderSeq,
      dish,
      patience: ORDER_PATIENCE,
      maxPatience: ORDER_PATIENCE,
      reward: DISHES[dish].price,
    });
  }

  function reset() {
    Object.assign(state, freshState());
  }

  function startShift() {
    reset();
    state.screen = 'play';
    spawnOrder();
    spawnOrder();
    state.spawnTimer = ORDER_SPAWN.start;
  }

  function endShift(reason) {
    state.screen = 'over';
    state.overReason = reason;
    state.stars = state.served >= 14 ? 3 : state.served >= 9 ? 2 : state.served >= 5 ? 1 : 0;
  }

  /** Take a raw ingredient from its bin into the chef's hand. */
  function takeIngredient(id) {
    if (state.hand) {
      say('Hands full — serve or trash it first.');
      return EVENT_ERROR;
    }
    state.hand = id;
    state.chef.targetX = BIN.x + INGREDIENTS[id].bin * (BIN.w + BIN.gap) + BIN.w / 2;
    return 0;
  }

  function useGrill() {
    const slotIndex = state.grill.findIndex((s) => s === null);
    if (state.hand === 'patty' && slotIndex >= 0) {
      state.grill[slotIndex] = { item: 'patty', t: 0 };
      state.hand = null;
      state.chef.targetX = STATIONS.grill.x + STATIONS.grill.w / 2;
      return 0;
    }
    // Pick up a finished (or raw) patty from a grill slot.
    for (let i = 0; i < state.grill.length; i += 1) {
      const slot = state.grill[i];
      if (!slot) continue;
      if (slot.t >= GRILL.cook + GRILL.burn) {
        state.grill[i] = null;
        say('Burnt! Tossed in the trash.');
        return EVENT_BURNT;
      }
      if (state.hand) {
        say('Hands full.');
        return EVENT_ERROR;
      }
      state.grill[i] = null;
      state.hand = slot.t >= GRILL.cook ? 'patty_cooked' : 'patty';
      state.chef.targetX = STATIONS.grill.x + STATIONS.grill.w / 2;
      return 0;
    }
    if (state.hand && state.hand !== 'patty') say('The grill is for patties — raw ones go on, cooked ones come off.');
    else say('Grab a raw patty from the counter first.');
    return EVENT_ERROR;
  }

  function usePot() {
    if (state.hand === 'noodle' && !state.pot) {
      state.pot = { item: 'noodle', t: 0 };
      state.hand = null;
      state.chef.targetX = STATIONS.pot.x + STATIONS.pot.w / 2;
      return 0;
    }
    if (state.pot) {
      if (state.hand) {
        say('Hands full.');
        return EVENT_ERROR;
      }
      if (state.pot.t >= POT.cook) {
        state.pot = null;
        state.hand = 'noodle_cooked';
        state.chef.targetX = STATIONS.pot.x + STATIONS.pot.w / 2;
        return 0;
      }
      say('Noodles are still boiling…');
      return EVENT_ERROR;
    }
    if (state.hand && state.hand !== 'noodle') say('The pot is for noodles.');
    else say('Grab noodles from the counter first.');
    return EVENT_ERROR;
  }

  function useBoard() {
    if (state.chopping) {
      say('Still chopping…');
      return EVENT_ERROR;
    }
    if (!state.hand) {
      say('Bring something to chop: lettuce, tomato or egg.');
      return EVENT_ERROR;
    }
    const prep = INGREDIENTS[state.hand] && INGREDIENTS[state.hand].prep;
    if (prep !== 'chop') {
      say(`${INGREDIENTS[state.hand].name} doesn't need chopping.`);
      return EVENT_ERROR;
    }
    state.chopping = { item: state.hand, t: 0 };
    state.hand = null;
    state.chef.targetX = STATIONS.board.x + STATIONS.board.w / 2;
    return 0;
  }

  function usePlate(index) {
    const plate = state.plates[index];
    if (state.hand) {
      if (!plateable(state.hand)) {
        const prep = INGREDIENTS[state.hand] ? INGREDIENTS[state.hand].prep : null;
        say(prep === 'grill' ? 'Grill the patty first!' : prep === 'pot' ? 'Boil the noodles first!' : 'Chop it on the board first!');
        return EVENT_ERROR;
      }
      if (plate.items.includes(state.hand)) {
        say('That is already on the plate.');
        return EVENT_ERROR;
      }
      if (plate.items.length >= 5) {
        say('Plate is full.');
        return EVENT_ERROR;
      }
      plate.items.push(state.hand);
      state.hand = null;
      state.chef.targetX = (index === 0 ? STATIONS.plateA : STATIONS.plateB).x + 65;
      return 0;
    }
    // Empty hand: take the top item back off the plate.
    if (plate.items.length === 0) {
      say('Plate is empty — add ingredients to it.');
      return EVENT_ERROR;
    }
    state.hand = plate.items.pop();
    return 0;
  }

  function serve() {
    state.chef.targetX = STATIONS.bell.x + STATIONS.bell.w / 2;
    let bestPlate = -1;
    let bestOrder = null;
    for (let p = 0; p < state.plates.length; p += 1) {
      for (const order of state.orders) {
        if (plateMatches(state.plates[p], order.dish)) {
          if (!bestOrder || order.patience < bestOrder.patience) {
            bestOrder = order;
            bestPlate = p;
          }
        }
      }
    }
    if (!bestOrder) {
      // Helpful hint: what is the closest plate missing?
      let hinted = false;
      for (let p = 0; p < state.plates.length; p += 1) {
        for (const order of state.orders) {
          const missing = missingFor(state.plates[p], order.dish);
          if (state.plates[p].items.length > 0 && missing.length > 0 && missing.length <= 2) {
            say(`${DISHES[order.dish].name} still needs: ${missing.map((m) => m.replace('_', ' ')).join(', ')}.`);
            hinted = true;
            break;
          }
        }
        if (hinted) break;
      }
      if (!hinted) say('No finished plate matches an order yet.');
      state.shake = 0.25;
      return EVENT_ERROR;
    }
    const dish = DISHES[bestOrder.dish];
    const tip = Math.round(5 * (bestOrder.patience / bestOrder.maxPatience));
    state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
    state.comboTimer = COMBO_WINDOW;
    const comboBonus = (state.combo - 1) * 2;
    const earned = dish.price + tip + comboBonus;
    state.coins += earned;
    state.served += 1;
    state.servedDishes.push(bestOrder.dish);
    state.orders = state.orders.filter((o) => o.id !== bestOrder.id);
    state.plates[bestPlate] = { items: [] };
    state.bellGlow = 0.9;
    const bell = STATIONS.bell;
    sparkle(bell.x + bell.w / 2, bell.y + 30, '#ffd94d');
    floater(bell.x + bell.w / 2, bell.y - 12, `+${earned} coins`, '#ffd94d');
    if (tip >= 4) floater(bell.x + bell.w / 2, bell.y - 38, 'Speedy service!', '#8be28b');
    return EVENT_SERVED;
  }

  function trashHand() {
    if (!state.hand) return EVENT_ERROR;
    state.hand = null;
    return 0;
  }

  /** Handle one click in logical coordinates; returns an event bitmask. */
  function clickAt(x, y) {
    if (state.screen !== 'play') return 0;
    // Mute / pause buttons live in the HUD; the main loop handles them.
    // Ingredient bins.
    if (y >= BIN.y && y <= BIN.y + BIN.h) {
      for (const id of INGREDIENT_KEYS) {
        const b = BIN.x + INGREDIENTS[id].bin * (BIN.w + BIN.gap);
        if (x >= b && x <= b + BIN.w) return takeIngredient(id);
      }
    }
    const inRect = (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    if (inRect(STATIONS.grill)) return useGrill();
    if (inRect(STATIONS.pot)) return usePot();
    if (inRect(STATIONS.board)) return useBoard();
    if (inRect(STATIONS.plateA)) return usePlate(0);
    if (inRect(STATIONS.plateB)) return usePlate(1);
    if (inRect(STATIONS.bell)) return serve();
    if (inRect(STATIONS.trash)) return trashHand();
    return 0;
  }

  /** Advance the world by `dt` seconds; returns an event bitmask. */
  function step(dt) {
    let events = 0;
    if (state.screen !== 'play') {
      // Idle animation still runs on the title screen.
      state.chef.bob += dt;
      return 0;
    }
    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

    // Chef walks toward the last station used.
    const chef = state.chef;
    const dx = chef.targetX - chef.x;
    chef.walking = Math.abs(dx) > 6;
    if (chef.walking) {
      const move = Math.sign(dx) * CHEF.speed * dt;
      chef.x += Math.abs(move) > Math.abs(dx) ? dx : move;
      chef.facing = Math.sign(dx);
      chef.bob += dt * 14;
    } else {
      chef.bob += dt * 2;
    }

    // Order spawns, faster as the shift goes on.
    const progress = state.elapsed / SHIFT_SECONDS;
    const interval = ORDER_SPAWN.start + (ORDER_SPAWN.end - ORDER_SPAWN.start) * progress;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnOrder();
      state.spawnTimer = interval;
    }

    // Patience drains; a customer who waits too long walks out.
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.walkouts += 1;
        state.combo = 0;
        state.comboTimer = 0;
        say('A customer walked out…');
        events |= EVENT_WALKOUT;
      }
    }

    // Grill timers.
    for (let i = 0; i < state.grill.length; i += 1) {
      const slot = state.grill[i];
      if (!slot) continue;
      const before = slot.t;
      slot.t += dt;
      if (before < GRILL.cook && slot.t >= GRILL.cook) events |= EVENT_GRILL_DONE;
      if (before < GRILL.cook + GRILL.burn && slot.t >= GRILL.cook + GRILL.burn) {
        events |= EVENT_BURNT;
        say('A patty burnt on the grill!');
      }
      if (slot.t < GRILL.cook + GRILL.burn && Math.random() < dt * 8) {
        steam(STATIONS.grill.x + 40 + i * 130, STATIONS.grill.y + 18);
      }
    }

    // Pot timer.
    if (state.pot) {
      const before = state.pot.t;
      state.pot.t += dt;
      if (before < POT.cook && state.pot.t >= POT.cook) events |= EVENT_POT_DONE;
      if (Math.random() < dt * 8) steam(STATIONS.pot.x + 75, STATIONS.pot.y + 18);
    }

    // Chopping.
    if (state.chopping) {
      state.chopping.t += dt;
      state.chopTick += dt;
      if (state.chopTick > 0.4) {
        state.chopTick = 0;
        events |= EVENT_CHOPPED;
      }
      if (state.chopping.t >= CHOP_SECONDS) {
        state.hand = PREPARED[state.chopping.item];
        state.chopping = null;
        events |= EVENT_CHOPPED;
      }
    }

    // Combo decay.
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    // Hint, shake, bell glow.
    if (state.hintTimer > 0) {
      state.hintTimer -= dt;
      if (state.hintTimer <= 0) state.hint = '';
    }
    if (state.shake > 0) state.shake -= dt;
    if (state.bellGlow > 0) state.bellGlow -= dt * 1.4;

    // Particles and floaters.
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
      const f = state.floaters[i];
      f.life -= dt;
      f.y -= 28 * dt;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }

    // Last-ten-seconds tick.
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10.5 && whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
    }

    if (state.timeLeft <= 0) {
      endShift('Shift over!');
      return events | EVENT_OVER;
    }
    if (state.walkouts >= MAX_WALKOUTS) {
      endShift('Too many customers walked out…');
      return events | EVENT_OVER;
    }
    return events;
  }

  return {
    state,
    reset,
    startShift,
    endShift,
    step,
    clickAt,
    takeIngredient,
    useGrill,
    usePot,
    useBoard,
    usePlate,
    serve,
    trashHand,
    say,
    plateMatches,
    missingFor,
  };
}
