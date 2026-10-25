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
const emailModules = Object.fromEntries([
  ["../../../lib/send-welcome-email", "../lib/send-welcome-email.ts"],
  ["./welcome-email", "../lib/welcome-email.ts"],
].map(([name, path]) => [name, ts.transpileModule(
  readFileSync(new URL(path, import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText]));

function handler(
  env = {},
  fetch = () => {
    throw new Error("Unexpected external call");
  },
  logs = [],
) {
  const context = {
    exports: {},
    require: (name) => {
      if (!emailModules[name]) return require(name);
      const moduleContext = { ...context, exports: {} };
      runInNewContext(emailModules[name], moduleContext);
      return moduleContext.exports;
    },
    Response,
    URL,
    AbortSignal,
    process: { env },
    fetch,
    console: { error: (...args) => logs.push(args) },
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
        "resolution=ignore-duplicates,return=representation",
      );
      assert.equal(options.headers.Authorization, "Bearer test-only-key");
      saved = JSON.parse(options.body);
      return Response.json([{ id: "new-signup-id" }], { status: 201 });
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

test("database diagnostics log only status and code without private details", async () => {
  const logs = [];
  const post = handler(
    {
      SUPABASE_URL: "https://project.example",
      SUPABASE_SERVICE_ROLE_KEY: "private-test-key",
    },
    async () => Response.json({
      code: "42501",
      message: "private-test-key person@example.com",
      details: "private database details",
    }, { status: 403 }),
    logs,
  );
  const response = await post(request());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "storage_failed");
  assert.equal(JSON.stringify(logs), JSON.stringify([
    ["Waitlist database write failed", { status: 403, code: "42501" }],
  ]));
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

const emailEnv = {
  SUPABASE_URL: "https://project.example",
  SUPABASE_SERVICE_ROLE_KEY: "test-db-key",
  RESEND_API_KEY: "test-email-key",
  WAITLIST_EMAIL_FROM: "Convert <hello@example.com>",
  WAITLIST_EMAIL_REPLY_TO: "support@example.com",
  SITE_URL: "https://convert.example.com",
};

test("a new signup receives the localized branded email only after storage succeeds", async () => {
  const calls = [];
  let emailOptions;
  const post = handler(emailEnv, async (url, options) => {
    calls.push(String(url));
    if (calls.length === 1) {
      assert.equal(url.searchParams.get("select"), "id");
      return Response.json([{ id: "signup-id" }], { status: 201 });
    }
    emailOptions = options;
    return Response.json({ id: "email-id" });
  });
  assert.equal((await post(request({ ...valid, language: "ka" }))).status, 201);
  assert.equal(calls.length, 2);
  assert.equal(calls[1], "https://api.resend.com/emails");
  assert.equal(emailOptions.headers.Authorization, "Bearer test-email-key");
  assert.equal(emailOptions.headers["Idempotency-Key"], "waitlist-welcome/signup-id");
  const content = JSON.parse(emailOptions.body);
  assert.deepEqual(content.to, ["person@example.com"]);
  assert.equal(content.from, emailEnv.WAITLIST_EMAIL_FROM);
  assert.equal(content.reply_to, emailEnv.WAITLIST_EMAIL_REPLY_TO);
  assert.match(content.subject, /Convert/);
  assert.match(content.html, /თქვენ სიაში ხართ/);
  assert.match(content.html, /https:\/\/convert.example.com\/icon.png/);
  assert.match(content.text, /მადლობა/);
});

test("duplicate signup reports already registered without sending another welcome email", async () => {
  let calls = 0;
  const post = handler(emailEnv, async () => {
    calls++;
    return Response.json([]);
  });
  const response = await post(request({ ...valid, email: "  Person@Example.com  " }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, alreadyRegistered: true });
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(calls, 1);
});

test("rejected storage does not send welcome email", async () => {
  let calls = 0;
  const post = handler(emailEnv, async () => {
    calls++;
    return Response.json({ code: "42501" }, { status: 403 });
  });
  assert.equal((await post(request())).status, 502);
  assert.equal(calls, 1);
});

test("provider rejection or network failure preserves successful signup without leaking private data", async () => {
  for (const networkFailure of [false, true]) {
    const logs = [];
    let calls = 0;
    const post = handler(emailEnv, async () => {
      if (++calls === 1) return Response.json([{ id: "signup-id" }]);
      if (networkFailure) throw new Error("person@example.com test-email-key");
      return Response.json({ message: "person@example.com test-email-key" }, { status: 403 });
    }, logs);
    assert.equal((await post(request())).status, 201);
    assert.equal(calls, 2);
    assert.match(JSON.stringify(logs), /welcome email/);
    assert.doesNotMatch(JSON.stringify(logs), /person@example.com|test-email-key/);
  }
});

test("incomplete email settings preserve storage and never call email provider", async () => {
  for (const override of [{ RESEND_API_KEY: "" }, { SITE_URL: "" }, { WAITLIST_EMAIL_FROM: "" }, { SITE_URL: "http://localhost:3000" }]) {
    let calls = 0;
    const post = handler({ ...emailEnv, ...override }, async () => {
      calls++;
      return Response.json([{ id: "signup-id" }]);
    });
    assert.equal((await post(request())).status, 201);
    assert.equal(calls, 1);
  }
});
