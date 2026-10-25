/**
 * Vercel serverless function: every /api/* request is routed here (see scripts-build-vercel.mjs).
 * The screens are served by Vercel as static files from dist/.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import { handleApi } from './app.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  // The route rewrite passes the original path as ?__p= in case the platform shows the rewritten URL.
  const rest = url.searchParams.get('__p');
  const path = url.pathname.startsWith('/api/') ? url.pathname : `/api/${rest ?? ''}`;
  await handleApi(req, res, path);
}
