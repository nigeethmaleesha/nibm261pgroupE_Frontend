import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  const value = process.env.BACKEND_API_BASE_URL?.trim();
  return value ? value.replace(/\/+$/, "") : null;
}

function splitCombinedSetCookieHeader(header: string) {
  const cookies: string[] = [];
  let start = 0;
  let inExpires = false;

  for (let index = 0; index < header.length; index += 1) {
    const remaining = header.slice(index).toLowerCase();

    if (remaining.startsWith("expires=")) inExpires = true;
    if (inExpires && header[index] === ";") inExpires = false;

    if (!inExpires && header[index] === ",") {
      const candidate = header.slice(start, index).trim();
      const nextPart = header.slice(index + 1);

      if (/^\s*[^=;,\s]+\s*=/.test(nextPart)) {
        if (candidate) cookies.push(candidate);
        start = index + 1;
      }
    }
  }

  const finalCookie = header.slice(start).trim();
  if (finalCookie) cookies.push(finalCookie);
  return cookies;
}

function getSetCookies(headers: Headers) {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const combined = headers.get("set-cookie");
  return combined ? splitCombinedSetCookieHeader(combined) : [];
}

export async function proxy(request: NextRequest) {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return NextResponse.json(
      { message: "Backend API configuration is missing." },
      { status: 500 },
    );
  }

  const { pathname, search } = request.nextUrl;
  const backendPath = pathname === "/api" ? "" : pathname.slice(4);
  const targetUrl = `${backendBaseUrl}${backendPath}${search}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("host");
  requestHeaders.delete("content-length");

  // This is a server-to-server hop. Removing the browser Origin avoids making
  // Express CORS configuration part of the local proxy path; browser CORS is
  // already satisfied because the browser only talks to the same-origin /api.
  requestHeaders.delete("origin");
  requestHeaders.delete("referer");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const responseHeaders = new Headers();

    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });

    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });

    for (const cookie of getSetCookies(backendResponse.headers)) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("[RepairFlow API Proxy] Backend request failed:", error);

    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return NextResponse.json(
      {
        message: timedOut
          ? "The RepairFlow backend took too long to respond."
          : "Unable to connect to the RepairFlow backend.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
