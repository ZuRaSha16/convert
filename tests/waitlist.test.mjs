import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL("../app/api/waitlist/route.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

function handler(
  env = {},
  fetch = () => {
    throw new Error("Unexpected external call");
  },
) {
  const context = {
    exports: {},
    require,
    Response,
    URL,
    AbortSignal,
    process: { env },
    fetch,
  };
  runInNewContext(compiled, context);
  return context.exports.POST;
}

const valid = {
  email: "person@example.com",
  consent: true,
  language: "en",
  website: "",
};
function request(body = valid, extraHeaders = {}) {
  return new Request("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

test("unconfigured storage never reports success", async () => {
  const response = await handler()(request());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "not_configured");
});

test("localhost normalization accepts the actual browser Host", async () => {
  assert.equal((await handler()(request())).status, 503);
});

test("cross-origin requests are rejected", async () => {
  assert.equal(
    (await handler()(request(valid, { origin: "https://other.example" })))
      .status,
    403,
  );
});

test("email, consent, language, and honeypot are validated", async () => {
  for (const invalid of [
    { email: "invalid" },
    { consent: false },
    { language: "fr" },
    { website: "bot" },
  ]) {
    assert.equal(
      (await handler()(request({ ...valid, ...invalid }))).status,
      400,
    );
  }
});

test("null, array, and oversized input are rejected", async () => {
  assert.equal((await handler()(request(null))).status, 400);
  assert.equal((await handler()(request([]))).status, 400);
  assert.equal(
    (await handler()(request({ ...valid, extra: "x".repeat(5000) }))).status,
    413,
  );
});

test("successful signup writes normalized data to the configured database", async () => {
  let saved;
  const post = handler(
    {
      SUPABASE_URL: "https://project.example",
      SUPABASE_SERVICE_ROLE_KEY: "test-only-key",
    },
    async (url, options) => {
      assert.equal(url.origin, "https://project.example");
      assert.equal(url.pathname, "/rest/v1/waitlist");
      assert.equal(url.searchParams.get("on_conflict"), "email");
      assert.equal(
        options.headers.Prefer,
        "resolution=ignore-duplicates,return=minimal",
      );
      assert.equal(options.headers.Authorization, "Bearer test-only-key");
      saved = JSON.parse(options.body);
      return new Response(null, { status: 201 });
    },
  );
  const response = await post(
    request({ ...valid, email: "  Person@Example.com  ", language: "ka" }),
  );
  assert.equal(response.status, 201);
  assert.equal(saved.email, "person@example.com");
  assert.equal(saved.language, "ka");
  assert.equal(saved.consent_version, "2026-10-20");
  assert.equal(saved.email_hash.length, 64);
});

test("a rejected database write is never reported as registration", async () => {
  const post = handler(
    {
      SUPABASE_URL: "https://project.example",
      SUPABASE_SERVICE_ROLE_KEY: "test",
    },
    async () => new Response(null, { status: 500 }),
  );
  const response = await post(request());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "storage_failed");
});

test("database network errors produce an honest unavailable response", async () => {
  const post = handler(
    {
      SUPABASE_URL: "https://project.example",
      SUPABASE_SERVICE_ROLE_KEY: "test",
    },
    async () => {
      throw new Error("Network unavailable");
    },
  );
  assert.equal((await post(request())).status, 503);
});

test("database secrets are never sent over plain HTTP", async () => {
  const post = handler({
    SUPABASE_URL: "http://project.example",
    SUPABASE_SERVICE_ROLE_KEY: "test",
  });
  assert.equal((await post(request())).status, 503);
});
