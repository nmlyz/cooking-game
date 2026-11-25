// Keyboard and pointer input. Clicks are reported as logical playfield points
// (the canvas is scaled, so client pixels are mapped back first). One-shot
// presses (start, pause, serve, mute) are queued as bit flags and taken once
// by the loop, so a press between two frames is never lost or counted twice.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_MUTE = 8;
export const ACTION_TRASH = 16;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const SERVE = new Set(['KeyS']);
const MUTE = new Set(['KeyM']);
const TRASH = new Set(['KeyT', 'Backspace', 'Delete']);

export function createInput(canvas, field) {
  let actions = 0;
  let clicks = [];
  let hover = { x: -1, y: -1 };
  const keys = new Set();

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * field.width,
      y: ((event.clientY - rect.top) / rect.height) * field.height,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    if (CONFIRM.has(event.code)) actions |= ACTION_CONFIRM;
    else if (PAUSE.has(event.code)) actions |= ACTION_PAUSE;
    else if (SERVE.has(event.code)) actions |= ACTION_SERVE;
    else if (MUTE.has(event.code)) actions |= ACTION_MUTE;
    else if (TRASH.has(event.code)) actions |= ACTION_TRASH;
    else if (event.code >= 'Digit1' && event.code <= 'Digit8') {
      // Ingredient hotkeys are read live from `keys`, not as actions.
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });
  window.addEventListener('blur', () => {
    keys.clear();
  });

  canvas.addEventListener('pointerdown', (event) => {
    clicks.push(toLogical(event));
    event.preventDefault();
  });
  canvas.addEventListener('pointermove', (event) => {
    hover = toLogical(event);
  });
  canvas.addEventListener('pointerleave', () => {
    hover = { x: -1, y: -1 };
  });

  return {
    /** One-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Click points since the last call, in logical coordinates. */
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
    /** Current hover point in logical coordinates (-1,-1 when off canvas). */
    hover() {
      return hover;
    },
    /** True while the given key code is held down. */
    keyDown(code) {
      return keys.has(code);
    },
    /** Consume one press of a Digit1..Digit8 hotkey, if any is queued. */
    takeDigit() {
      for (let n = 1; n <= 8; n += 1) {
        if (keys.has(`Digit${n}`)) {
          keys.delete(`Digit${n}`);
          return n;
        }
      }
      return 0;
    },
  };
}
