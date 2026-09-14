import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/** Serves /api/matches and /api/standings during `npm run dev` using the same logic as the
 * Vercel functions in api/matches.js and api/standings.js. */
function sportsDataDevApi(): Plugin {
  return {
    name: 'sports-data-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/matches', async (req, res) => {
        try {
          // @ts-expect-error - plain JS helper shared with the Vercel function in api/matches.js
          const { fetchMatches } = await import('./api/_lib/sportsrc.js');
          const url = new URL(req.url || '', 'http://localhost');
          const dateFrom = url.searchParams.get('dateFrom') || undefined;
          const dateTo = url.searchParams.get('dateTo') || undefined;
          const matches = await fetchMatches({ dateFrom, dateTo });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ matches }));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ matches: [], error: err instanceof Error ? err.message : 'Failed to fetch matches' }));
        }
      });

      server.middlewares.use('/api/standings', async (req, res) => {
        try {
          // @ts-expect-error - plain JS helper shared with the Vercel function in api/standings.js
          const { fetchStandings } = await import('./api/_lib/sportsrc.js');
          const url = new URL(req.url || '', 'http://localhost');
          const code = url.searchParams.get('competition');
          if (!code) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ standings: [], error: 'Missing competition query param' }));
            return;
          }
          const standings = await fetchStandings(code);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ standings }));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ standings: [], error: err instanceof Error ? err.message : 'Failed to fetch standings' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to import.meta.env; loadEnv here reads
  // the raw .env file (including SPORTSRC_API_KEY) into process.env for the dev server.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), tailwindcss(), sportsDataDevApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
