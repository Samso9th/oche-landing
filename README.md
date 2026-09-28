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
| `VITE_APP_URL` | `https://ship.oche.io` (where "Sign in" goes) |
| `VITE_API_URL` | `https://deploy.oche.io` (the waitlist form posts to `/waitlist` there) |

Signups land in the dashboard under Settings → Waitlist, which only the owner sees. Inviting someone adds their GitHub login to People; Oche doesn't email them.

## Where things are

- `src/three/hero-scene.ts`: the 3D mark. Seven extruded bands, commit rails in the stage colours, bloom. It pauses when off screen and renders one still frame for reduced motion.
- `src/components/hero-canvas.tsx`: mounts the scene. Falls back to the flat mark without WebGL.
- `src/components/waitlist-form.tsx`: the signup form. It has a hidden honeypot field, and the server rate-limits by IP.
- `src/sections/`: one file per section. The CLI section is marked coming soon until the package is published. The PR card, terminal and build log copy the product's real wording (bot comment, check name, `oche ship` output), so update them if that wording changes.
