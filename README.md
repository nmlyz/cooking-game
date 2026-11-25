[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/nmlyz/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/nmlyz/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Sizzle & Serve — Bistro Rush

A complete cooking game that runs in a desktop browser from static files, with no network request. You run a small bistro through the lunch rush: orders appear on the board, and you chop, grill and boil ingredients, stack them on plates, and ring the bell to serve before each customer's patience runs out. The final 45 seconds turn into the Lunch Rush — orders arrive faster and every dish pays 1.5×, so the shift is won or lost in the finale.

## How to play

Serve every order on the board before its patience bar empties. A full 3-minute shift, four dishes on the menu, and a combo bonus for serving dishes back to back.

- **Grab ingredients** — click a bin on the bottom counter, or press keys `1`–`8`.
- **Prep them** — lettuce, tomato and egg go on the chopping board; patties go on the grill (watch the ring: green means ready, leave it too long and it burns); noodles go in the pot.
- **Stack a plate** — click a plate with a prepared ingredient in hand. Click a plate with an empty hand to take the top item back off.
- **Serve** — when a plate holds exactly what a ticket asks for, it glows gold. Click the bell, or press `S`, to serve it and collect coins plus a speed tip.
- **Keep the rush going** — serving quickly builds a combo worth extra coins. Customers who wait too long walk out, and five walkouts end the shift early.
- **Lunch Rush** — with 45 seconds left the timer turns red and reads RUSH: new orders arrive almost twice as fast, every ticket is marked ×1.5, and each dish pays half again on top of its price, tip and combo. It is the best moment to cash in — and the easiest moment to lose a customer.

## The menu

| Dish | Needs | Coins |
| --- | --- | --- |
| Classic Burger | bun, grilled patty, chopped lettuce, chopped tomato | 18 |
| Cheese Burger | bun, grilled patty, cheese, chopped tomato | 22 |
| Garden Salad | chopped lettuce, chopped tomato, chopped egg | 14 |
| Golden Ramen | boiled noodles, broth, chopped egg | 20 |

During the Lunch Rush each dish pays 1.5× its listed price.

## Controls

- Mouse: click bins, stations, plates and the bell. The chef walks over to the station you use.
- `1`–`8`: grab an ingredient. `S`: ring the bell. `T`: throw away what you are holding. `P` / `Esc`: pause. `M`: mute. `Space` / `Enter`: start or restart.

## Run it locally

```sh
node serve.ts
```

Then open http://localhost:8080 — the game is `game/index.html` plus its own modules under `game/src/`. Sound is synthesised in the browser with WebAudio; all art is drawn on canvas. Nothing is fetched from the network.

Best shift score is kept in your browser only.

## Layout

- `main.ts` — the hand-in program (Node 22): copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` — the game page.
- `game/src/config.js` — tuning, recipes, stations, colours, Lunch Rush numbers.
- `game/src/world.js` — orders, stations, plates, scoring, the shift clock, the Lunch Rush.
- `game/src/render.js` — all drawing: kitchen, order board, chef, plates, screens.
- `game/src/input.js` — mouse and keyboard.
- `game/src/audio.js` — synthesised sounds (chop, sizzle, bell, coins, rush alarm).
- `game/src/shots.js` — staged screenshot scenes.
- `game/src/main.js` — boot and the fixed-step loop.
- `game/src/random.js` — seeded random for repeatable games.
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged.
- `screenshots/` — real renders of the game running in a browser.
