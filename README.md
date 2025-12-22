# Anand Sakshi Archive

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/eternal-warmth-a-living-archive)

A modern full-stack application built on Cloudflare Workers, featuring a React frontend with shadcn/ui components, serverless API with Hono, and persistent storage via Durable Objects. This project demonstrates real-time collaboration, stateful data management, and seamless deployment on Cloudflare's edge network.

## Features

- **Full-Stack Edge Application**: React + TypeScript frontend with Cloudflare Workers backend.
- **Durable Objects**: Persistent storage for counters, demo items, and custom state.
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode support, animations.
- **API-First Backend**: Hono routes with CORS, logging, error handling, and health checks.
- **Client-Side Features**: React Query for data fetching, error boundaries, theme toggle, responsive design.
- **Demo Endpoints**: Counter increment/decrement, CRUD for demo items.
- **Production-Ready**: TypeScript, ESLint, Vite bundling, Wrangler deployment.
- **Observability**: Built-in logging and error reporting.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, Lucide icons, React Router, TanStack Query, Sonner toasts, Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects.
- **Styling**: Tailwind CSS with custom animations, CSS variables.
- **Tools**: Bun (package manager), Wrangler (deployment), ESLint.
- **Libraries**: Zod (validation), Immer (state), UUID, Recharts (optional charts).

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`).
   - [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest login`).

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd anand-sakshi-archive-vlkmqxyaxektr6ue-jnow
   bun install
   ```

3. **Run Locally**:
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or `$PORT`).

## Development

- **Frontend**: `src/` directory with Vite + React. Edit `src/pages/HomePage.tsx` for UI changes.
- **Backend**: `worker/userRoutes.ts` for custom API routes. Uses Durable Objects for state (counter, demo items).
- **Shared Types**: `shared/` for TypeScript types across client/server.
- **Type Generation**: `bun run cf-typegen` after `wrangler deploy`.
- **Build**: `bun build` (frontend) or `bun run deploy`.
- **Lint**: `bun lint`.
- **Preview**: `bun preview`.

### API Examples

Test endpoints at `/api/*`:

```bash
# Health check
curl http://localhost:3000/api/health

# Demo items (GET/POST/PUT/DELETE)
curl http://localhost:3000/api/demo
curl -X POST http://localhost:3000/api/demo -H "Content-Type: application/json" -d '{"id":"3","name":"New Item","value":100}'

# Counter
curl http://localhost:3000/api/counter
curl -X POST http://localhost:3000/api/counter/increment
```

### Customizing

- **UI**: Replace `src/pages/HomePage.tsx`. Use shadcn/ui components from `@/components/ui/*`.
- **Routes**: Add to `worker/userRoutes.ts`. Core files (`worker/index.ts`, `worker/durableObject.ts`) are protected.
- **Durable Objects**: Extend `GlobalDurableObject` methods in `worker/durableObject.ts`.
- **Theme**: Toggle via `ThemeToggle`. Custom CSS in `src/index.css`.

## Deployment

Deploy to Cloudflare Workers/Pages with one command:

```bash
bun run deploy
```

This builds the frontend (`dist/`) and deploys via Wrangler. Assets are served as a SPA.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/eternal-warmth-a-living-archive)

**Manual Steps**:
1. `bunx wrangler@latest login`
2. `bunx wrangler@latest deploy --name anand-sakshi-archive-vlkmqxyaxektr6ue-jnow`

Custom domain? Update `wrangler.jsonc`. View logs/metrics in [Cloudflare Dashboard](https://dash.cloudflare.com).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server (frontend + worker proxy) |
| `bun build` | Build frontend |
| `bun lint` | Lint code |
| `bun preview` | Preview production build |
| `bun run deploy` | Build + deploy |
| `bun run cf-typegen` | Generate Worker types |

## Environment Variables

None required. All config in `wrangler.jsonc`.

## Contributing

1. Fork & clone.
2. `bun install`.
3. Create feature branch.
4. `bun dev` for testing.
5. Submit PR.

## License

MIT. See [LICENSE](LICENSE) for details.

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/)
- File issues here.

Built with ❤️ on Cloudflare's edge.