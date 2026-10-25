import { createHash } from "node:crypto";
import { sendWelcomeEmail } from "../../../lib/send-welcome-email";

// This endpoint never reports success before the configured database accepts a row.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      // Next dev may normalize request.url to localhost while the browser uses 127.0.0.1.
      // Compare the browser origin against the actual incoming Host header instead.
      const originUrl = new URL(origin);
      if (
        !/^https?:$/.test(originUrl.protocol) ||
        originUrl.host !== request.headers.get("host")
      )
        throw new Error("Origin mismatch");
    } catch {
      return Response.json({ code: "invalid_origin" }, { status: 403 });
    }
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ code: "invalid_content_type" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 4096)
    return Response.json({ code: "too_large" }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 4096)
      return Response.json({ code: "too_large" }, { status: 413 });
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Invalid body");
  } catch {
    return Response.json({ code: "invalid_request" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    body.consent !== true ||
    (body.language !== "en" && body.language !== "ka") ||
    body.website
  ) {
    return Response.json({ code: "invalid_submission" }, { status: 400 });
  }
  const databaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!databaseUrl || !serviceKey)
    return Response.json(
      { code: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );

  try {
    const endpoint = new URL(
      "/rest/v1/waitlist?on_conflict=email&select=id",
      databaseUrl,
    );
    if (endpoint.protocol !== "https:")
      throw new Error("Database must use HTTPS");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=representation",
      },
      body: JSON.stringify({
        email,
        language: body.language,
        consent_version: "2026-10-20",
        source: "landing-page",
        email_hash: createHash("sha256").update(email).digest("hex"),
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) {
      // Log only status and a bounded error code, never submitted data or credentials.
      const error = await response.json().catch(() => null);
      const databaseCode =
        typeof error?.code === "string" && /^[A-Z0-9_]{1,32}$/.test(error.code)
          ? error.code
          : "unknown";
      console.error("Waitlist database write failed", {
        status: response.status,
        code: databaseCode,
      });
      return Response.json({ code: "storage_failed" }, { status: 502 });
    }
    const inserted: unknown = await response.json().catch(() => null);
    if (Array.isArray(inserted) && inserted.length === 0) {
      return Response.json(
        { ok: true, alreadyRegistered: true },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (Array.isArray(inserted) && typeof inserted[0]?.id === "string") {
      await sendWelcomeEmail(email, body.language, inserted[0].id);
    }
    return Response.json(
      { ok: true },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ code: "temporarily_unavailable" }, { status: 503 });
  }
}
