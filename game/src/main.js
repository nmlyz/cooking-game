// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between four screens:
// title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { BEST_KEY, FIELD, INGREDIENTS, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_BURNT, EVENT_CHOPPED, EVENT_ERROR, EVENT_GRILL_DONE, EVENT_OVER, EVENT_POT_DONE, EVENT_RUSH, EVENT_SERVED, EVENT_WALKOUT } from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_SERVE, ACTION_TRASH, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

/** HUD buttons (mute is text at the top right; pause is the P key). */
const MUTE_BUTTON = { x: 1140, y: 8, w: 140, h: 42 };

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
// Debug hook for play-testing (read-only state inspection from the console).
window.__world = world;
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null, audio.muted);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, FIELD);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.startShift();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Serve every order before patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    audio.win();
    announce(`Shift over. ${world.state.served} dishes served, ${world.state.coins} coins. Best ${best}.`);
  }

  function playEvents(events) {
    if (events & EVENT_SERVED) {
      audio.serve();
      audio.coin();
    }
    if (events & EVENT_RUSH) audio.rush();
    if (events & EVENT_WALKOUT) audio.walkout();
    if (events & EVENT_GRILL_DONE) audio.grillDone();
    if (events & EVENT_POT_DONE) audio.grillDone();
    if (events & EVENT_BURNT) audio.burnt();
    if (events & EVENT_CHOPPED) audio.chop();
    if (events & EVENT_ERROR) audio.error();
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        // The mute corner is not clickable on overlays; anywhere starts.
        startGame();
        continue;
      }
      if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
        continue;
      }
      // Mute button in the HUD.
      if (click.x >= MUTE_BUTTON.x && click.x <= MUTE_BUTTON.x + MUTE_BUTTON.w
        && click.y >= MUTE_BUTTON.y && click.y <= MUTE_BUTTON.y + MUTE_BUTTON.h) {
        audio.toggleMuted();
        continue;
      }
      const before = world.state.hand;
      const events = world.clickAt(click.x, click.y);
      if (events === 0 && world.state.hand !== before) audio.pickup();
      else if (events === 0) audio.click();
      playEvents(events);
      if (events & EVENT_SERVED) {
        announce(`Served! ${world.state.coins} coins, ${world.state.served} dishes.`);
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      audio.toggleMuted();
      return;
    }
    if (actions & ACTION_TRASH && screen === SCREEN_PLAY) {
      if (world.trashHand() === 0) audio.place();
      return;
    }
    if (actions & ACTION_SERVE && screen === SCREEN_PLAY) {
      playEvents(world.serve());
      return;
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      startGame();
      return;
    }
    if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleHotkeys() {
    if (screen !== SCREEN_PLAY) return;
    const digit = input.takeDigit();
    if (digit === 0) return;
    const id = Object.keys(INGREDIENTS).find((k) => INGREDIENTS[k].key === String(digit));
    if (!id) return;
    audio.unlock();
    const events = world.takeIngredient(id);
    if (events === 0) audio.pickup();
    else playEvents(events);
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP);
      return;
    }
    const events = world.step(STEP);
    playEvents(events);
    if (events & EVENT_OVER) endGame();
    else if (events & EVENT_WALKOUT) {
      announce(`A customer walked out. ${world.state.walkouts} walkouts.`);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleHotkeys();
    handleClicks();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, input.hover(), audio.muted);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Sizzle and Serve. Press Space or click to start your shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
