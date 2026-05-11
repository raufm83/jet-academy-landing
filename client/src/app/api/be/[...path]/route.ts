import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Brauzerdən backend-ə birbaşa sorğuda CORS (xüsusən PATCH + multipart) pozula bilər.
 * Bədən stream ilə forward bəzi mühitlərdə 500 verir — arrayBuffer ilə ötürülür.
 */
function upstreamBase(): string {
  const raw =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.jetacademy.az/api";
  return raw.replace(/\/+$/, "");
}

const FORWARD_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "accept-language",
  "cookie",
] as const;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function buildTargetUrl(pathSegments: string[], search: string): string {
  const path = pathSegments.filter(Boolean).join("/");
  return `${upstreamBase()}/${path}${search}`;
}

async function proxy(req: NextRequest, pathSegments: string[]) {
  const url = buildTargetUrl(pathSegments, req.nextUrl.search);
  const method = req.method.toUpperCase();

  try {
    const headers = new Headers();
    for (const name of FORWARD_REQUEST_HEADERS) {
      const v = req.headers.get(name);
      if (v) headers.set(name, v);
    }

    let body: ArrayBuffer | undefined;
    if (!["GET", "HEAD"].includes(method)) {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    }

    const upstream = await fetch(url, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP.has(key.toLowerCase())) return;
      outHeaders.set(key, value);
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  } catch (err) {
    console.error("[api/be proxy]", url, err);
    return NextResponse.json(
      {
        statusCode: 502,
        message:
          "API ilə əlaqə alınmadı (proksi). Şəbəkəni və fayl ölçüsünü (maks. 5 MB) yoxlayın.",
      },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  return proxy(req, ctx.params.path ?? []);
}

export async function POST(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  return proxy(req, ctx.params.path ?? []);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  return proxy(req, ctx.params.path ?? []);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  return proxy(req, ctx.params.path ?? []);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  return proxy(req, ctx.params.path ?? []);
}
