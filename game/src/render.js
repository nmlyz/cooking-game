// Everything the player sees: the bistro kitchen, order board, counters,
// stations, plates, the chef and every screen. All art is drawn with canvas
// paths — no images, no emoji, nothing fetched — so the game renders the
// same on any desktop browser.
import {
  BIN, CHEF, CHOP_SECONDS, DISHES, FIELD, FONT, GRILL, INGREDIENTS,
  PALETTE, POT, SHIFT_SECONDS, STATIONS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Draw one ingredient (raw or prepared) as a small vector icon. */
export function drawIngredient(ctx, item, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const base = INGREDIENTS[item];
  switch (item) {
    case 'bun': {
      ctx.fillStyle = '#e8a94f';
      ctx.beginPath();
      ctx.arc(0, 2, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98a35';
      ctx.fillRect(-r, 0, r * 2, r * 0.32);
      ctx.fillStyle = '#fff2cf';
      circle(ctx, -r * 0.4, -r * 0.45, r * 0.12); ctx.fill();
      circle(ctx, r * 0.35, -r * 0.55, r * 0.12); ctx.fill();
      circle(ctx, 0, -r * 0.7, r * 0.1); ctx.fill();
      break;
    }
    case 'patty': {
      ctx.fillStyle = '#8a4b2d';
      rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
      ctx.fill();
      ctx.fillStyle = '#6e3a20';
      ctx.fillRect(-r * 0.6, -r * 0.2, r * 0.18, r * 0.9);
      ctx.fillRect(-r * 0.1, -r * 0.2, r * 0.18, r * 0.9);
      ctx.fillRect(r * 0.4, -r * 0.2, r * 0.18, r * 0.9);
      break;
    }
    case 'patty_cooked': {
      ctx.fillStyle = '#5d3018';
      rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
      ctx.fill();
      ctx.strokeStyle = '#3d1f0e';
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.4); ctx.lineTo(-r * 0.3, r * 0.4);
      ctx.moveTo(0, -r * 0.4); ctx.lineTo(r * 0.3, r * 0.4);
      ctx.moveTo(r * 0.6, -r * 0.4); ctx.lineTo(r * 0.9, r * 0.4);
      ctx.stroke();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#7cc24a';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r, -r * 0.4, r * 0.7, r * 0.5);
      ctx.quadraticCurveTo(r * 0.3, r, 0, r * 0.7);
      ctx.quadraticCurveTo(-r * 0.3, r, -r * 0.7, r * 0.5);
      ctx.quadraticCurveTo(-r, -r * 0.4, 0, -r);
      ctx.fill();
      ctx.strokeStyle = '#4c8a26';
      ctx.lineWidth = Math.max(1.5, r * 0.1);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.6);
      ctx.stroke();
      break;
    }
    case 'lettuce_chopped': {
      ctx.fillStyle = '#7cc24a';
      for (const [dx, dy, s] of [[-0.5, -0.4, 0.55], [0.4, -0.5, 0.5], [0, 0.3, 0.6], [-0.6, 0.4, 0.45], [0.55, 0.45, 0.45]]) {
        rr(ctx, dx * r - s * r, dy * r - s * r * 0.7, s * r * 2, s * r * 1.4, 2);
        ctx.fill();
      }
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e84a3a';
      circle(ctx, 0, 0, r);
      ctx.fill();
      ctx.fillStyle = '#f2826f';
      circle(ctx, 0, 0, r * 0.62);
      ctx.fill();
      ctx.strokeStyle = '#e84a3a';
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
        ctx.stroke();
      }
      ctx.fillStyle = '#f2b8a0';
      circle(ctx, 0, 0, r * 0.16);
      ctx.fill();
      break;
    }
    case 'tomato_chopped': {
      ctx.fillStyle = '#e84a3a';
      for (const [dx, dy] of [[-0.45, -0.35], [0.4, -0.45], [0, 0.1], [-0.5, 0.45], [0.5, 0.4]]) {
        rr(ctx, dx * r - r * 0.4, dy * r - r * 0.3, r * 0.8, r * 0.6, 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f2826f';
      circle(ctx, 0, 0, r * 0.2);
      ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.6);
      ctx.lineTo(r, r * 0.6);
      ctx.lineTo(0, -r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0a100';
      circle(ctx, -r * 0.25, r * 0.2, r * 0.16); ctx.fill();
      circle(ctx, r * 0.3, r * 0.3, r * 0.13); ctx.fill();
      circle(ctx, 0, -r * 0.25, r * 0.12); ctx.fill();
      break;
    }
    case 'egg': {
      // Whole egg: cream shell with a warm outline so it reads on the
      // pale bin behind it.
      ctx.fillStyle = '#fff3d6';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a86a';
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f2d06b';
      circle(ctx, 0, -r * 0.15, r * 0.2);
      ctx.fill();
      break;
    }
    case 'egg_chopped': {
      ctx.fillStyle = '#fff3d6';
      rr(ctx, -r * 0.8, -r * 0.6, r * 0.9, r * 0.7, 3); ctx.fill();
      rr(ctx, r * 0.1, -r * 0.5, r * 0.8, r * 0.7, 3); ctx.fill();
      ctx.fillStyle = '#f2b01e';
      circle(ctx, -r * 0.35, -r * 0.25, r * 0.28); ctx.fill();
      circle(ctx, r * 0.45, -r * 0.15, r * 0.24); ctx.fill();
      ctx.fillStyle = '#fff3d6';
      rr(ctx, -r * 0.6, r * 0.2, r * 1.1, r * 0.55, 3); ctx.fill();
      break;
    }
    case 'noodle': {
      ctx.strokeStyle = '#f2d06b';
      ctx.lineWidth = Math.max(2.5, r * 0.22);
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, i * r * 0.5);
        ctx.quadraticCurveTo(-r * 0.3, i * r * 0.5 - r * 0.45, r * 0.2, i * r * 0.5);
        ctx.quadraticCurveTo(r * 0.6, i * r * 0.5 + r * 0.4, r * 0.9, i * r * 0.5 - r * 0.1);
        ctx.stroke();
      }
      break;
    }
    case 'noodle_cooked': {
      ctx.fillStyle = '#f2d06b';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a13a';
      ctx.lineWidth = Math.max(2, r * 0.14);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0.4, 4.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 1.2, 5.0);
      ctx.stroke();
      break;
    }
    case 'broth': {
      ctx.fillStyle = '#3f6fb5';
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.85, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c96a2e';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.05, r * 0.72, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.5); ctx.quadraticCurveTo(-r * 0.45, -r * 0.85, -r * 0.25, -r * 1.05);
      ctx.moveTo(r * 0.25, -r * 0.5); ctx.quadraticCurveTo(r * 0.1, -r * 0.85, r * 0.3, -r * 1.05);
      ctx.stroke();
      break;
    }
    default: {
      if (base) {
        ctx.fillStyle = base.color;
        circle(ctx, 0, 0, r);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, rx, ry) {
  ctx.fillStyle = '#e8e4da';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.72, ry * 0.68, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 6;
  circle(ctx, x, y, r);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || FIELD.width;
    const h = canvas.clientHeight || FIELD.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform((canvas.width / FIELD.width), 0, 0, (canvas.height / FIELD.height), 0, 0);
  }

  function drawWall() {
    // Warm tiled wall, a window with a street view, hanging lamps, shelves.
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(0, 0, FIELD.width, 240);
    ctx.fillStyle = PALETTE.tile;
    for (let y = 8; y < 240; y += 42) {
      for (let x = (y % 84 === 8 ? 0 : -26); x < FIELD.width; x += 52) {
        ctx.strokeStyle = PALETTE.tileLine;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, 50, 40);
      }
    }
    // Window.
    ctx.fillStyle = '#7a4a22';
    rr(ctx, 500, 26, 280, 130, 10);
    ctx.fill();
    ctx.fillStyle = '#aee3f5';
    rr(ctx, 510, 36, 260, 110, 8);
    ctx.fill();
    ctx.fillStyle = '#fff6c9';
    circle(ctx, 712, 66, 18);
    ctx.fill();
    ctx.fillStyle = '#8fce7d';
    ctx.beginPath();
    ctx.moveTo(510, 146);
    ctx.lineTo(580, 92); ctx.lineTo(640, 146);
    ctx.lineTo(700, 104); ctx.lineTo(770, 146);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8542f';
    circle(ctx, 600, 118, 7); ctx.fill();
    circle(ctx, 668, 122, 7); ctx.fill();
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(640, 36); ctx.lineTo(640, 146);
    ctx.stroke();
    // Shelves with jars and plants.
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(40, 96, 200, 10);
    ctx.fillRect(1040, 96, 200, 10);
    const jars = ['#c96a2e', '#7cc24a', '#e84a3a', '#ffc93c'];
    jars.forEach((c, i) => {
      ctx.fillStyle = c;
      rr(ctx, 58 + i * 48, 62, 32, 34, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(62 + i * 48, 66, 6, 26);
    });
    ctx.fillStyle = '#4caf50';
    circle(ctx, 1080, 78, 20); ctx.fill();
    circle(ctx, 1112, 82, 15); ctx.fill();
    ctx.fillStyle = '#c96a2e';
    rr(ctx, 1072, 88, 56, 8, 3); ctx.fill();
    ctx.fillStyle = '#3f6fb5';
    rr(ctx, 1170, 58, 44, 38, 6); ctx.fill();
    // Hanging lamps.
    for (const lx of [330, 640, 950]) {
      ctx.strokeStyle = '#5b3a1e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, 0); ctx.lineTo(lx, 34);
      ctx.stroke();
      ctx.fillStyle = '#e8542f';
      ctx.beginPath();
      ctx.moveTo(lx - 26, 52); ctx.lineTo(lx + 26, 52); ctx.lineTo(lx + 12, 30); ctx.lineTo(lx - 12, 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffe9a8';
      circle(ctx, lx, 54, 10);
      ctx.fill();
    }
    // Floor.
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 560, FIELD.width, 160);
    ctx.fillStyle = PALETTE.floorLine;
    for (let x = 0; x < FIELD.width; x += 64) ctx.fillRect(x, 560, 2, 160);
    for (let y = 600; y < 720; y += 40) ctx.fillRect(0, y, FIELD.width, 2);
  }

  function drawOrderBoard(state) {
    // Wooden rail + tickets.
    ctx.fillStyle = PALETTE.board;
    rr(ctx, 24, 66, 1232, 118, 12);
    ctx.fill();
    text(ctx, 'ORDER BOARD', 44, 92, 15, '#d9b380', 800);
    if (state.orders.length === 0) {
      text(ctx, 'No orders yet — the lunch rush is coming…', 480, 140, 16, '#d9b380', 600, 'left');
      return;
    }
    state.orders.forEach((order, i) => {
      const dish = DISHES[order.dish];
      const x = 170 + i * 258;
      const y = 74;
      const w = 244;
      const h = 102;
      const frac = Math.max(0, order.patience / order.maxPatience);
      const barColor = frac > 0.5 ? '#4caf50' : frac > 0.25 ? '#ff9800' : '#d32f2f';
      ctx.save();
      ctx.translate(i % 2 === 0 ? -1 : 1, 0);
      ctx.fillStyle = PALETTE.boardPaper;
      rr(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = dish.color;
      ctx.lineWidth = 3;
      rr(ctx, x, y, w, h, 8);
      ctx.stroke();
      // Pin.
      ctx.fillStyle = dish.color;
      circle(ctx, x + w / 2, y + 4, 5);
      ctx.fill();
      text(ctx, `#${order.id}  ${dish.name.toUpperCase()}`, x + 12, y + 26, 15, PALETTE.text, 800);
      text(ctx, `${order.reward} coins`, x + w - 12, y + 26, 14, '#b57a28', 800, 'right');
      // Required ingredient icons.
      dish.needs.forEach((need, j) => {
        drawIngredient(ctx, need, x + 24 + j * 38, y + 52, 13);
      });
      // Patience bar.
      ctx.fillStyle = '#e8ddc8';
      rr(ctx, x + 12, y + 76, w - 24, 12, 6);
      ctx.fill();
      ctx.fillStyle = barColor;
      rr(ctx, x + 12, y + 76, Math.max(12, (w - 24) * frac), 12, 6);
      ctx.fill();
      // During the Lunch Rush every ticket pays half again.
      if (state.rush) text(ctx, 'RUSH ×1.5', x + w - 12, y + 99, 11, '#b57a28', 800, 'right');
      ctx.restore();
    });
  }

  function drawStations(state, hover) {
    const s = STATIONS;
    const shakeX = state.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
    ctx.save();
    ctx.translate(shakeX, 0);
    // Long steel counter.
    ctx.fillStyle = PALETTE.steelDark;
    rr(ctx, 36, 288, 1208, 158, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.steel;
    rr(ctx, 36, 288, 1208, 20, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(36, 308, 1208, 10);

    // Grill: two burners with flames and patty states.
    ctx.fillStyle = '#3a3a3a';
    rr(ctx, s.grill.x, s.grill.y, s.grill.w, s.grill.h, 10);
    ctx.fill();
    state.grill.forEach((slot, i) => {
      const cx = s.grill.x + 62 + i * 126;
      const cy = s.grill.y + 62;
      ctx.fillStyle = '#1d1d1d';
      circle(ctx, cx, cy, 42);
      ctx.fill();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      circle(ctx, cx, cy, 42);
      ctx.stroke();
      if (slot) {
        const frac = slot.t / GRILL.cook;
        const burnt = slot.t >= GRILL.cook + GRILL.burn;
        // Flame under a cooking patty.
        if (!burnt) {
          ctx.fillStyle = slot.t >= GRILL.cook ? '#ffb347' : '#ff8a3d';
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(cx - 26, cy + 30);
          ctx.quadraticCurveTo(cx - 30, cy - 6, cx, cy - 22);
          ctx.quadraticCurveTo(cx + 30, cy - 6, cx + 26, cy + 30);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        drawIngredient(ctx, burnt ? 'patty_cooked' : 'patty', cx, cy - 4, 26);
        if (burnt) {
          ctx.fillStyle = '#222';
          text(ctx, 'BURNT', cx, cy - 34, 13, '#ff6b5e', 800, 'center');
        } else {
          drawProgressRing(ctx, cx, cy, 50, Math.min(1, frac), slot.t >= GRILL.cook ? '#4caf50' : '#ff8a3d');
        }
      } else {
        text(ctx, '+', cx, cy + 8, 30, '#666', 700, 'center');
      }
    });
    text(ctx, 'GRILL', s.grill.x + s.grill.w / 2, s.grill.y + s.grill.h - 8, 12, '#cfd6de', 800, 'center');

    // Pot.
    ctx.fillStyle = '#2e2e2e';
    rr(ctx, s.pot.x, s.pot.y, s.pot.w, s.pot.h, 10);
    ctx.fill();
    const pcx = s.pot.x + s.pot.w / 2;
    const pcy = s.pot.y + 58;
    ctx.fillStyle = '#8b96a3';
    ctx.beginPath();
    ctx.arc(pcx, pcy, 46, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c96a2e';
    ctx.beginPath();
    ctx.ellipse(pcx, pcy - 2, 40, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (state.pot) {
      const frac = Math.min(1, state.pot.t / POT.cook);
      drawIngredient(ctx, 'noodle', pcx, pcy - 6, 24);
      drawProgressRing(ctx, pcx, pcy, 54, frac, state.pot.t >= POT.cook ? '#4caf50' : '#ff8a3d');
    }
    text(ctx, 'POT', pcx, s.pot.y + s.pot.h - 8, 12, '#cfd6de', 800, 'center');

    // Chopping board.
    ctx.fillStyle = '#d9a05b';
    rr(ctx, s.board.x, s.board.y, s.board.w, s.board.h, 10);
    ctx.fill();
    ctx.fillStyle = '#e8bd7d';
    rr(ctx, s.board.x + 10, s.board.y + 10, s.board.w - 20, s.board.h - 34, 6);
    ctx.fill();
    if (state.chopping) {
      const frac = Math.min(1, state.chopping.t / CHOP_SECONDS);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      circle(ctx, s.board.x + s.board.w / 2, s.board.y + 52, 34);
      ctx.fill();
      drawIngredient(ctx, state.chopping.item, s.board.x + s.board.w / 2, s.board.y + 52, 26);
      drawProgressRing(ctx, s.board.x + s.board.w / 2, s.board.y + 52, 38, frac, '#4caf50');
      text(ctx, 'CHOPPING…', s.board.x + s.board.w / 2, s.board.y + s.board.h - 8, 12, '#7d4f24', 800, 'center');
    } else {
      // Knife resting on the board.
      ctx.fillStyle = '#dfe6ee';
      ctx.save();
      ctx.translate(s.board.x + 150, s.board.y + 52);
      ctx.rotate(-0.5);
      rr(ctx, -34, -7, 52, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#5b3a1e';
      rr(ctx, 18, -6, 26, 12, 5);
      ctx.fill();
      ctx.restore();
      text(ctx, 'CHOPPING BOARD', s.board.x + s.board.w / 2, s.board.y + s.board.h - 8, 12, '#7d4f24', 800, 'center');
    }

    // Plates.
    [STATIONS.plateA, STATIONS.plateB].forEach((rect, i) => {
      const plate = state.plates[i];
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + 62;
      drawPlate(ctx, cx, cy, 56, 20);
      plate.items.forEach((item, j) => {
        drawIngredient(ctx, item, cx, cy - 8 - j * 13, 17);
      });
      // Match glow: a plate that completes an order shines, and its label
      // turns into the call to serve it.
      const matches = state.orders.some((o) => {
        const needs = DISHES[o.dish].needs;
        return plate.items.length === needs.length && needs.every((n) => plate.items.includes(n));
      });
      if (matches) {
        ctx.strokeStyle = '#ffd94d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 62, 26, 0, 0, Math.PI * 2);
        ctx.stroke();
        text(ctx, 'READY TO SERVE', cx, rect.y + rect.h - 8, 12, '#ffd94d', 800, 'center');
      } else {
        text(ctx, `PLATE ${i + 1}`, cx, rect.y + rect.h - 8, 12, '#cfd6de', 800, 'center');
      }
    });

    // Serve window + bell.
    const bell = STATIONS.bell;
    ctx.fillStyle = '#fff8e7';
    rr(ctx, bell.x, bell.y, bell.w, bell.h, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.board;
    ctx.fillRect(bell.x, bell.y, bell.w, 12);
    text(ctx, 'SERVE HERE', bell.x + bell.w / 2, bell.y + 30, 13, PALETTE.text, 800, 'center');
    const glow = state.bellGlow > 0 ? state.bellGlow : 0;
    if (glow > 0) {
      ctx.fillStyle = `rgba(255, 217, 77, ${0.35 * glow})`;
      circle(ctx, bell.x + bell.w / 2, bell.y + 78, 44 + 10 * glow);
      ctx.fill();
    }
    // Bell dome.
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(bell.x + bell.w / 2, bell.y + 84, 30, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a6d1f';
    ctx.fillRect(bell.x + bell.w / 2 - 34, bell.y + 82, 68, 6);
    ctx.fillStyle = '#e8c93c';
    circle(ctx, bell.x + bell.w / 2, bell.y + 52, 5);
    ctx.fill();
    text(ctx, 'RING THE BELL', bell.x + bell.w / 2, bell.y + bell.h - 8, 11, '#8a6d4b', 800, 'center');
    // Served dishes on the pass shelf, under the bell dome.
    state.servedDishes.slice(-4).forEach((dishId, i) => {
      drawIngredient(ctx, DISHES[dishId].needs[1], bell.x + 26 + i * 44, bell.y + 104, 10);
    });

    // Trash.
    const tr = STATIONS.trash;
    ctx.fillStyle = '#5d6b7a';
    rr(ctx, tr.x, tr.y, tr.w, tr.h, 6);
    ctx.fill();
    text(ctx, 'TRASH', tr.x + tr.w / 2, tr.y + 29, 12, '#fff', 800, 'center');

    // Hover highlight.
    if (hover && hover.x >= 0) {
      const zones = [STATIONS.grill, STATIONS.pot, STATIONS.board, STATIONS.plateA, STATIONS.plateB, STATIONS.bell, STATIONS.trash];
      for (const z of zones) {
        if (hover.x >= z.x && hover.x <= z.x + z.w && hover.y >= z.y && hover.y <= z.y + z.h) {
          ctx.strokeStyle = 'rgba(255, 217, 77, 0.9)';
          ctx.lineWidth = 3;
          rr(ctx, z.x - 3, z.y - 3, z.w + 6, z.h + 6, 12);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function drawBins(state, hover) {
    // Bottom counter with eight ingredient bins.
    ctx.fillStyle = PALETTE.counterFront;
    rr(ctx, 36, BIN.y - 8, 1208, BIN.h + 26, 12);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    rr(ctx, 36, BIN.y - 8, 1208, 16, 8);
    ctx.fill();
    text(ctx, 'INGREDIENTS — click a bin or press 1–8', 52, BIN.y - 18, 13, '#ffe9b8', 700);
    Object.values(INGREDIENTS).forEach((ing) => {
      const bx = BIN.x + ing.bin * (BIN.w + BIN.gap);
      const by = BIN.y;
      const hovered = hover && hover.x >= bx && hover.x <= bx + BIN.w && hover.y >= by && hover.y <= by + BIN.h;
      ctx.fillStyle = hovered ? '#fff3d6' : '#fdf6e3';
      rr(ctx, bx, by, BIN.w, BIN.h, 10);
      ctx.fill();
      ctx.strokeStyle = ing.color;
      ctx.lineWidth = 3;
      rr(ctx, bx, by, BIN.w, BIN.h, 10);
      ctx.stroke();
      drawIngredient(ctx, Object.keys(INGREDIENTS).find((k) => INGREDIENTS[k] === ing), bx + BIN.w / 2, by + 34, 22);
      text(ctx, ing.name.toUpperCase(), bx + BIN.w / 2, by + 74, 12, PALETTE.text, 800, 'center');
      ctx.fillStyle = '#b57a28';
      circle(ctx, bx + BIN.w - 14, by + 14, 10);
      ctx.fill();
      text(ctx, ing.key, bx + BIN.w - 14, by + 18, 12, '#fff', 800, 'center');
      if (ing.prep === 'chop') text(ctx, 'chop it', bx + BIN.w / 2, by + 90, 10, '#4c8a26', 700, 'center');
      if (ing.prep === 'grill') text(ctx, 'grill it', bx + BIN.w / 2, by + 90, 10, '#a34d1e', 700, 'center');
      if (ing.prep === 'pot') text(ctx, 'boil it', bx + BIN.w / 2, by + 90, 10, '#3f6fb5', 700, 'center');
    });
  }

  function drawChef(state) {
    const chef = state.chef;
    const bobY = chef.walking ? Math.abs(Math.sin(chef.bob)) * -6 : Math.sin(chef.bob) * 1.5;
    const x = chef.x;
    const y = CHEF.y + bobY;
    ctx.save();
    ctx.translate(x, y);
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 108 - bobY, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs.
    const step = chef.walking ? Math.sin(chef.bob) * 8 : 0;
    ctx.fillStyle = '#3a3a3a';
    rr(ctx, -14 + step, 78, 12, 30, 5); ctx.fill();
    rr(ctx, 2 - step, 78, 12, 30, 5); ctx.fill();
    // Body / apron.
    ctx.fillStyle = '#f5f5f5';
    rr(ctx, -26, 22, 52, 60, 14); ctx.fill();
    ctx.fillStyle = '#e8542f';
    rr(ctx, -26, 48, 52, 34, 10); ctx.fill();
    ctx.fillStyle = '#fff';
    text(ctx, 'S&S', 0, 72, 12, '#fff', 800, 'center');
    // Arms.
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    const armSwing = chef.walking ? Math.sin(chef.bob) * 6 : 0;
    ctx.beginPath();
    ctx.moveTo(-24, 34); ctx.lineTo(-36, 58 + armSwing);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 34); ctx.lineTo(36, 58 - armSwing);
    ctx.stroke();
    // Head.
    ctx.fillStyle = '#f2c89b';
    circle(ctx, 0, 2, 22);
    ctx.fill();
    // Toque.
    ctx.fillStyle = '#ffffff';
    circle(ctx, -12, -16, 12); ctx.fill();
    circle(ctx, 0, -20, 13); ctx.fill();
    circle(ctx, 12, -16, 12); ctx.fill();
    ctx.fillRect(-18, -18, 36, 8);
    // Face.
    ctx.fillStyle = '#2e1c0e';
    const look = chef.facing >= 0 ? 3 : -3;
    circle(ctx, -8 + look, 0, 2.5); ctx.fill();
    circle(ctx, 8 + look, 0, 2.5); ctx.fill();
    ctx.strokeStyle = '#2e1c0e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 6, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,84,58,0.35)';
    circle(ctx, -14, 7, 4); ctx.fill();
    circle(ctx, 14, 7, 4); ctx.fill();
    // Held item floats in a bubble by the chef's hands, clear of the
    // station labels above.
    if (state.hand) {
      ctx.fillStyle = 'rgba(255,248,231,0.95)';
      circle(ctx, 46, 30, 22);
      ctx.fill();
      ctx.strokeStyle = '#e0bd7d';
      ctx.lineWidth = 2;
      circle(ctx, 46, 30, 22);
      ctx.stroke();
      drawIngredient(ctx, state.hand, 46, 30, 15);
    }
    ctx.restore();
  }

  function drawParticles(state) {
    for (const p of state.particles) {
      const frac = p.life / p.maxLife;
      if (p.kind === 'steam') {
        ctx.fillStyle = `rgba(255,255,255,${0.5 * frac})`;
        circle(ctx, p.x, p.y, p.size * (1.6 - frac * 0.6));
        ctx.fill();
      } else {
        ctx.fillStyle = p.color || '#ffd94d';
        ctx.globalAlpha = frac;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 6);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }
    ctx.font = `800 20px ${FONT}`;
    ctx.textAlign = 'center';
    for (const f of state.floaters) {
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawHud(state, muted) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, 58);
    ctx.fillStyle = PALETTE.accent;
    ctx.fillRect(0, 58, FIELD.width, 4);
    text(ctx, 'SIZZLE & SERVE', 24, 38, 24, '#ffe9b8', 800);
    text(ctx, 'Bistro Rush', 236, 38, 13, '#d9b380', 600);
    // Timer — during the Lunch Rush it turns red and reads RUSH.
    const urgent = state.timeLeft <= 30;
    const rushPulse = state.rush ? 0.5 + 0.5 * Math.sin(state.elapsed * 6) : 0;
    ctx.fillStyle = state.rush ? (rushPulse > 0.5 ? '#d32f2f' : '#e8542f') : urgent ? '#ff6b5e' : '#fff8e7';
    rr(ctx, 560, 9, 160, 40, 10);
    ctx.fill();
    text(ctx, state.rush ? `RUSH ${mmss(state.timeLeft)}` : `TIME ${mmss(state.timeLeft)}`, 640, 38, 24, (state.rush || urgent) ? '#ffffff' : '#2e1c0e', 800, 'center');
    if (state.rush) text(ctx, '×1.5', 724, 37, 13, '#ffd94d', 800);
    // Coins / served / combo.
    text(ctx, `Coins  ${state.coins}`, 760, 38, 20, '#ffd94d', 800);
    text(ctx, `Served  ${state.served}`, 920, 38, 20, '#fff8e7', 700);
    if (state.combo > 1) {
      ctx.fillStyle = '#e8542f';
      rr(ctx, 1040, 12, 110, 34, 17);
      ctx.fill();
      text(ctx, `COMBO x${state.combo}`, 1095, 35, 16, '#fff', 800, 'center');
    }
    // Mute + pause hints.
    text(ctx, muted ? 'MUTED (M)' : 'SOUND (M)', 1232, 24, 11, '#d9b380', 700, 'right');
    text(ctx, 'PAUSE (P)', 1232, 42, 11, '#d9b380', 700, 'right');
  }

  function drawHint(state) {
    if (!state.hint) return;
    ctx.fillStyle = 'rgba(46,28,14,0.88)';
    const w = Math.min(760, ctx.measureText(state.hint).width + 40);
    rr(ctx, (FIELD.width - 560) / 2, 668, 560, 34, 17);
    ctx.fill();
    ctx.font = `700 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe9b8';
    ctx.fillText(state.hint, FIELD.width / 2, 690);
  }

  function drawTitle(state, best) {
    drawWall();
    drawOrderBoard(state);
    drawStations(state, null);
    drawBins(state, null);
    drawChef(state);
    ctx.fillStyle = 'rgba(46,28,14,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    // Title card.
    ctx.fillStyle = '#fff8e7';
    rr(ctx, 290, 96, 700, 470, 20);
    ctx.fill();
    ctx.strokeStyle = '#e8542f';
    ctx.lineWidth = 4;
    rr(ctx, 290, 96, 700, 470, 20);
    ctx.stroke();
    text(ctx, 'SIZZLE & SERVE', 640, 178, 56, '#e8542f', 800, 'center');
    text(ctx, '— Bistro Rush —', 640, 212, 20, '#8a6d4b', 700, 'center');
    text(ctx, 'Run the lunch rush: take orders, chop, grill and boil,', 640, 256, 17, PALETTE.text, 600, 'center');
    text(ctx, 'stack the plate and ring the bell before patience runs out.', 640, 280, 17, PALETTE.text, 600, 'center');
    // Menu cards.
    Object.values(DISHES).forEach((dish, i) => {
      const x = 330 + i * 168;
      ctx.fillStyle = '#fdf6e3';
      rr(ctx, x, 306, 152, 128, 10);
      ctx.fill();
      ctx.strokeStyle = dish.color;
      ctx.lineWidth = 2;
      rr(ctx, x, 306, 152, 128, 10);
      ctx.stroke();
      dish.needs.forEach((need, j) => drawIngredient(ctx, need, x + 26 + j * 34, 340, 12));
      text(ctx, dish.name, x + 76, 372, 14, PALETTE.text, 800, 'center');
      text(ctx, `${dish.price} coins`, x + 76, 396, 13, '#b57a28', 800, 'center');
      text(ctx, dish.blurb, x + 76, 418, 11, '#8a6d4b', 600, 'center');
    });
    text(ctx, 'Click a bin or press 1–8 to grab food  •  Click a station to use it  •  S rings the bell', 640, 472, 14, PALETTE.text, 600, 'center');
    text(ctx, 'Final 45 seconds: LUNCH RUSH — every order pays 1.5×!', 640, 452, 14, '#e8542f', 800, 'center');
    ctx.fillStyle = '#e8542f';
    rr(ctx, 490, 496, 300, 48, 24);
    ctx.fill();
    text(ctx, 'START SHIFT  —  Space / Click', 640, 527, 17, '#fff', 800, 'center');
    if (best > 0) text(ctx, `Best shift: ${best} coins`, 640, 556, 14, '#8a6d4b', 700, 'center');
  }

  function drawPaused(state) {
    ctx.fillStyle = 'rgba(46,28,14,0.66)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#fff8e7';
    rr(ctx, 440, 250, 400, 180, 16);
    ctx.fill();
    text(ctx, 'PAUSED', 640, 320, 40, '#e8542f', 800, 'center');
    text(ctx, 'Press P or Space to keep cooking', 640, 360, 16, PALETTE.text, 600, 'center');
    text(ctx, 'M mutes the sound', 640, 388, 14, '#8a6d4b', 600, 'center');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(46,28,14,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#fff8e7';
    rr(ctx, 340, 110, 600, 470, 20);
    ctx.fill();
    ctx.strokeStyle = '#e8542f';
    ctx.lineWidth = 4;
    rr(ctx, 340, 110, 600, 470, 20);
    ctx.stroke();
    text(ctx, 'SHIFT OVER', 640, 180, 44, '#e8542f', 800, 'center');
    text(ctx, state.overReason || 'Great cooking!', 640, 212, 16, '#8a6d4b', 700, 'center');
    // Stars.
    for (let i = 0; i < 3; i += 1) {
      const cx = 640 + (i - 1) * 90;
      const lit = i < state.stars;
      ctx.fillStyle = lit ? '#ffc93c' : '#d9cdb4';
      ctx.save();
      ctx.translate(cx, 268);
      ctx.beginPath();
      for (let k = 0; k < 10; k += 1) {
        const r = k % 2 === 0 ? 34 : 15;
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    const rows = [
      ['Dishes served', String(state.served)],
      ['Coins earned', `${state.coins}`],
      ['Customers walked out', String(state.walkouts)],
      ['Best shift', `${Math.max(best, state.coins)} coins`],
    ];
    rows.forEach(([label, value], i) => {
      const y = 350 + i * 36;
      text(ctx, label, 420, y, 18, PALETTE.text, 600);
      text(ctx, value, 860, y, 18, '#b57a28', 800, 'right');
    });
    ctx.fillStyle = '#e8542f';
    rr(ctx, 490, 508, 300, 48, 24);
    ctx.fill();
    text(ctx, 'COOK AGAIN  —  Space / Click', 640, 539, 17, '#fff', 800, 'center');
  }

  function draw(state, screen, best, hover, muted) {
    fit();
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) {
      drawTitle(state, best);
      return;
    }
    drawWall();
    drawOrderBoard(state);
    drawStations(state, hover);
    drawBins(state, hover);
    drawChef(state);
    drawParticles(state);
    drawHud(state, muted);
    drawHint(state);
    if (screen === SCREEN_PAUSED) drawPaused(state);
    if (screen === SCREEN_OVER) drawOver(state, best);
  }

  return { draw, drawIngredient };
}
