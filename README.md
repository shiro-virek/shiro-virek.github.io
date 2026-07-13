# Creative Coding Lab

A generative art playground and creative coding sandbox built with **zero dependencies** — pure vanilla JavaScript, HTML5 Canvas, WebGL, and the Web Audio API.

Explore **40+ interactive generative art scenes**, from particle systems and fractals to cellular automata, 3D wireframes, WebGL shaders, and real-time webcam effects.

---

## Features

- **40+ generative art scenes** — randomly selected on each visit, or pick one from the side menu
- **Seeded randomness** — reproducible outputs via URL query parameter (`?seed=1234567890`)
- **Interactive** — mouse/touch drag, click, and per-scene custom controls
- **Export** — download the current canvas as PNG or record it as WebM video
- **Progressive Web App** — installable, with offline support via service worker
- **No build step** — open `index.html` in any browser (or serve with any static HTTP server)

---

## Art Scenes

| Scene | Description |
|---|---|
| Confetti | Falling confetti particles |
| Fire | Rising flame particle system |
| Rotators / Rotators 2 | Rotating 2D objects |
| Bokeh | Soft bokeh circle effects |
| Skyscrapers | Procedural city skyline |
| Metro | Subway map-like visuals |
| 3D / 3D w/lights | Interactive 3D wireframes with lighting |
| Chaos / Chaos 2 | Strange attractor visualizations |
| Screen / Screen 2 | Pixel manipulation & halftone effects |
| Conway | Conway's Game of Life (load images, toggle cells) |
| Trail | Grid trail effect |
| Bouncing Balls | Physics-based ball simulation |
| Cthulhu | Tentacle-like generative art |
| CRT | CRT monitor scanline effect |
| Distortion | Image lens distortion effects |
| Blinkenlights | Cellular automaton variants |
| Shader | WebGL fragment shader sandbox |
| Gravity Balls | Gravity-attracted particles |
| Webcam | Live webcam feed with pixel effects |
| Fractals | Mandelbrot, Julia, and more |
| Noise | Perlin/value noise visualization |
| Tree | Procedural tree generator |
| Clay / Clay 2 | Organic clay-like forms |
| Hopalong | Hopalong attractor |
| Lyapunov | Lyapunov fractal |
| Walker | Random walker |
| Streets | Procedural street generation |
| Filters | Real-time image filters |
| Video | Video playback with effects |
| 3D FPS | First-person 3D walkthrough with virtual joystick|
| Joystick | Virtual joystick interaction |
| Network | Network/graph visualization |

---

## Getting Started

```bash
# Serve the directory with any static HTTP server
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Then open http://localhost:8000
```

No installation, no dependencies, no build step required.

---

## Usage

- **`☰`** — Toggle side menu to browse all scenes
- **`🎲`** — Load a random scene
- **`🔄`** — Re-randomize the current scene's parameters
- **`❌`** — Clear canvas / reset
- **`📤`** — Upload an image (used by Conway, Filters, etc.)
- **`📸`** — Download canvas as PNG
- **`📹`** — Record / stop recording canvas as WebM video

URL parameters:
- `?art=<name>` — load a specific scene (e.g., `?art=conway`)
- `?seed=<number>` — set a specific random seed

---

## Project Structure

```
├── index.html              # Single entry point
├── styles.css              # All styles
├── manifest.json           # PWA manifest
├── Service_Worker.js       # Offline caching
├── scripts/
│   ├── art/                # 40 generative art scene scripts
│   ├── main/               # Core app: canvas setup, script management
│   └── utils/              # Utility library (Random, Color, Drawing, Effects, etc.)
├── assets/                 # Sample images and video
├── fonts/                  # Custom pixel font (BULKYPIX)
└── web.config              # IIS MIME type config
```

---

## Tech Stack

- **Language:** Vanilla JavaScript (ES6+)
- **Rendering:** HTML5 Canvas 2D, WebGL
- **Sound:** Web Audio API (procedural audio)
- **Styling:** Pure CSS3 with custom properties
- **Build:** None

---

## License

MIT
