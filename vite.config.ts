import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/** Serves /api/matches during `npm run dev` using the same logic as the Vercel function in api/matches.js. */
function footballDataDevApi(): Plugin {
  return {
    name: 'football-data-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/matches', async (_req, res) => {
        try {
          // @ts-expect-error - plain JS helper shared with the Vercel function in api/matches.js
          const { fetchUpcomingMatches } = await import('./api/_lib/footballData.js');
          const matches = await fetchUpcomingMatches({ days: 10 });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ matches }));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ matches: [], error: err instanceof Error ? err.message : 'Failed to fetch matches' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to import.meta.env; loadEnv here reads
  // the raw .env file (including FOOTBALL_DATA_API_KEY) into process.env for the dev server.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), tailwindcss(), footballDataDevApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
