import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM_BASE_URL = process.env.CLONE_V2_API_BASE_URL?.trim() || "http://127.0.0.1:8787";
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function buildUpstreamUrl(request: NextRequest, path: string[]): string {
  const incoming = new URL(request.url);
  const upstream = new URL(UPSTREAM_BASE_URL);
  const suffix = path.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
  upstream.pathname = `/api/v1${suffix}`;
  upstream.search = incoming.search;
  return upstream.toString();
}

function copyRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalized)) return;
    headers.set(key, value);
  });
  return headers;
}

function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalized)) return;
    headers.set(key, value);
  });
  return headers;
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const params = await context.params;
  const path = Array.isArray(params?.path) ? params.path : [];
  const upstreamUrl = buildUpstreamUrl(request, path);
  const method = request.method.toUpperCase();

  const init: RequestInit = {
    method,
    headers: copyRequestHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: copyResponseHeaders(upstreamResponse),
    });
  } catch (error) {
    const payload = {
      ok: false,
      error: "upstream_unreachable",
      detail: String(error),
      upstream: UPSTREAM_BASE_URL,
    };
    return Response.json(payload, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxy(request, context);
}
