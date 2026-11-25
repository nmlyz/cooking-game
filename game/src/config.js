// Sizzle & Serve — every tuning number, colour and recipe in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** One shift lasts three minutes of play. */
export const SHIFT_SECONDS = 180;

/** Orders waiting on the board at most; a new one spawns while a slot is free. */
export const MAX_ORDERS = 4;

/** Seconds between order spawns (shrinks as the shift goes on). */
export const ORDER_SPAWN = { start: 11, end: 6.5 };

/** Seconds of patience an order has before the customer walks out. */
export const ORDER_PATIENCE = 55;

/** Grill: seconds to a perfect patty, then seconds before it burns. */
export const GRILL = { cook: 6, burn: 5 };

/** Pot: seconds to cook noodles. */
export const POT = { cook: 5 };

/** Cutting board: seconds to chop one item. */
export const CHOP_SECONDS = 1.6;

/** Combo: serving again within this many seconds raises the combo. */
export const COMBO_WINDOW = 20;

/** Lunch Rush: the final stretch of the shift, when orders pay extra. */
export const RUSH_SECONDS = 45;
/** Orders spawn this much faster during the rush (multiplier on the interval). */
export const RUSH_SPAWN_FACTOR = 0.55;
/** Serve pay multiplier during the rush (1.5 = +50% on the dish price). */
export const RUSH_PAY_MULTIPLIER = 1.5;

/** How many customers may walk out before the shift is ruined (0 = never ends early). */
export const MAX_WALKOUTS = 5;

export const BEST_KEY = 'sizzle-and-serve.best-coins';

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
export const FONT_DISPLAY = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

export const PALETTE = {
  wallTop: '#f7e8c9',
  wallBottom: '#eecfa0',
  tile: '#f3d9a8',
  tileLine: '#e0bd7d',
  floor: '#8a5a33',
  floorLine: '#744a28',
  counterTop: '#c98d4b',
  counterFront: '#a06a35',
  counterEdge: '#7d4f24',
  steel: '#b9c2cc',
  steelDark: '#8b96a3',
  steelLight: '#dfe6ee',
  board: '#5b3a1e',
  boardPaper: '#fff8e7',
  hud: '#3a2413',
  hudText: '#ffe9b8',
  accent: '#e8542f',
  accentLight: '#ff8a3d',
  green: '#4caf50',
  gold: '#ffc93c',
  red: '#d32f2f',
  text: '#2e1c0e',
  muted: '#8a6d4b',
};

/**
 * Ingredients. `chop` means it must be chopped before it can go on a plate;
 * `grill` means it must be grilled; `pot` means it must be boiled.
 * `key` is the keyboard shortcut, `bin` the counter position (0-7).
 */
export const INGREDIENTS = {
  bun:     { name: 'Bun',      short: 'BUN',  key: '1', bin: 0, color: '#e8a94f', dark: '#b57a28', prep: null },
  patty:   { name: 'Patty',    short: 'PATTY', key: '2', bin: 1, color: '#8a4b2d', dark: '#5d3018', prep: 'grill' },
  lettuce: { name: 'Lettuce',  short: 'LETTUCE', key: '3', bin: 2, color: '#7cc24a', dark: '#4c8a26', prep: 'chop' },
  tomato:  { name: 'Tomato',   short: 'TOMATO', key: '4', bin: 3, color: '#e84a3a', dark: '#b22a1e', prep: 'chop' },
  cheese:  { name: 'Cheese',   short: 'CHEESE', key: '5', bin: 4, color: '#ffc93c', dark: '#e0a100', prep: null },
  egg:     { name: 'Egg',      short: 'EGG',  key: '6', bin: 5, color: '#fff3d6', dark: '#e8cf9a', prep: 'chop' },
  noodle:  { name: 'Noodles',  short: 'NOODLES', key: '7', bin: 6, color: '#f2d06b', dark: '#c9a13a', prep: 'pot' },
  broth:   { name: 'Broth',    short: 'BROTH', key: '8', bin: 7, color: '#c96a2e', dark: '#96501f', prep: null },
};

/** Prepared forms an ingredient takes after its station step. */
export const PREPARED = {
  patty: 'patty_cooked',
  lettuce: 'lettuce_chopped',
  tomato: 'tomato_chopped',
  egg: 'egg_chopped',
  noodle: 'noodle_cooked',
};

/** What a prepared item is called on a plate. */
export const ITEM_NAMES = {
  bun: 'Bun',
  patty_cooked: 'Grilled Patty',
  lettuce_chopped: 'Chopped Lettuce',
  tomato_chopped: 'Chopped Tomato',
  cheese: 'Cheese',
  egg_chopped: 'Chopped Egg',
  noodle_cooked: 'Cooked Noodles',
  broth: 'Broth',
};

/**
 * The menu. `needs` is the exact set of prepared items a plate must hold.
 * `color` tints the ticket; `tip` is the patience bonus paid on a fast serve.
 */
export const DISHES = {
  burger: {
    name: 'Classic Burger', short: 'BURGER', price: 18, color: '#e8542f',
    needs: ['bun', 'patty_cooked', 'lettuce_chopped', 'tomato_chopped'],
    blurb: 'The house classic.',
  },
  cheeseburger: {
    name: 'Cheese Burger', short: 'CHEESEBURGER', price: 22, color: '#f2a007',
    needs: ['bun', 'patty_cooked', 'cheese', 'tomato_chopped'],
    blurb: 'Extra melt.',
  },
  salad: {
    name: 'Garden Salad', short: 'SALAD', price: 14, color: '#4caf50',
    needs: ['lettuce_chopped', 'tomato_chopped', 'egg_chopped'],
    blurb: 'Crisp, fresh.',
  },
  ramen: {
    name: 'Golden Ramen', short: 'RAMEN', price: 20, color: '#c96a2e',
    needs: ['noodle_cooked', 'broth', 'egg_chopped'],
    blurb: 'Steaming comfort.',
  },
};

export const DISH_ORDER = ['burger', 'cheeseburger', 'salad', 'ramen'];

/** Clickable station rectangles, in logical coordinates. */
export const STATIONS = {
  grill: { x: 52, y: 300, w: 250, h: 130, label: 'GRILL' },
  pot: { x: 322, y: 300, w: 150, h: 130, label: 'POT' },
  board: { x: 492, y: 300, w: 210, h: 130, label: 'CHOPPING BOARD' },
  plateA: { x: 722, y: 300, w: 130, h: 130, label: 'PLATE 1' },
  plateB: { x: 872, y: 300, w: 130, h: 130, label: 'PLATE 2' },
  bell: { x: 1042, y: 300, w: 186, h: 130, label: 'SERVE' },
  trash: { x: 1150, y: 470, w: 80, h: 46, label: 'TRASH' },
};

/** Ingredient bins along the bottom counter. */
export const BIN = { x: 52, y: 560, w: 138, h: 96, gap: 10 };

/** Where the chef walks (floor line). */
export const CHEF = { y: 470, speed: 420, width: 64, height: 110 };
