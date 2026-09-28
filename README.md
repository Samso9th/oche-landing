# Oche landing

The page at oche.io. Vite, React 19, Tailwind 4 and the dashboard's brand tokens (dark side only). The hero is plain three.js in its own chunk, loaded after first paint; the "how it works" board is CSS 3D driven by scroll.

```sh
npm install
npm run dev        # http://localhost:5174
npm run build
```

## Deploy

Build the Dockerfile and serve it on `oche.io` and `www.oche.io`. nginx redirects `www` to the bare domain.

| Build arg | Default |
| --- | --- |
| `VITE_APP_URL` | `https://ship.oche.io` (where "Open Oche" and "Sign in" go) |

## Where things are

- `src/three/hero-scene.ts`: the 3D mark. Seven extruded bands, commit rails in the stage colours, bloom. It pauses when off screen and renders one still frame for reduced motion.
- `src/components/hero-canvas.tsx`: mounts the scene. Falls back to the flat mark without WebGL.
- `src/sections/`: one file per section. The PR card, terminal and build log copy the product's real wording (bot comment, check name, `oche ship` output), so update them if that wording changes.
