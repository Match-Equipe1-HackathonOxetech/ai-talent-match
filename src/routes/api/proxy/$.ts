// Same-origin proxy to the external Python backend, to bypass browser CORS.
// The browser calls /api/proxy/<path>; this Worker forwards to the Render API.
import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://aimetch-talent.onrender.com";

async function forward(request: Request, splat: string | undefined) {
  const incoming = new URL(request.url);
  const target = new URL(UPSTREAM + "/" + (splat ?? "") + incoming.search);

  const headers = new Headers();
  const ct = request.headers.get("content-type");
  const auth = request.headers.get("authorization");
  const accept = request.headers.get("accept");
  if (ct) headers.set("content-type", ct);
  if (auth) headers.set("authorization", auth);
  if (accept) headers.set("accept", accept);

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(target.toString(), {
    method,
    headers,
    body,
  });

  const resHeaders = new Headers();
  const upCt = upstream.headers.get("content-type");
  if (upCt) resHeaders.set("content-type", upCt);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export const Route = createFileRoute("/api/proxy/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => forward(request, params._splat),
      POST: async ({ request, params }) => forward(request, params._splat),
      PUT: async ({ request, params }) => forward(request, params._splat),
      PATCH: async ({ request, params }) => forward(request, params._splat),
      DELETE: async ({ request, params }) => forward(request, params._splat),
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
