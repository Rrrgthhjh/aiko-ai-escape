import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Capture o handler antes de importar o módulo (Deno.serve vira no-op em testes).
let handler: ((req: Request) => Promise<Response>) | null = null;
const origServe = Deno.serve;
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (h: any) => {
  handler = h;
  return { finished: Promise.resolve(), shutdown: async () => {}, ref: () => {}, unref: () => {} } as any;
};

Deno.env.set("LOVABLE_API_KEY", "test-key");
await import("./index.ts");
(Deno as any).serve = origServe;

// Stub global fetch para capturar o payload enviado ao gateway.
type Captured = { url: string; body: any };
let captured: Captured | null = null;
const origFetch = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  captured = { url, body: JSON.parse(String(init?.body ?? "{}")) };
  const stream = new ReadableStream({
    start(c) { c.enqueue(new TextEncoder().encode("data: [DONE]\n")); c.close(); },
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}) as typeof fetch;

function makeMessages(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `msg-${i}`,
  }));
}

async function call(body: unknown) {
  captured = null;
  const req = new Request("http://x/", { method: "POST", body: JSON.stringify(body) });
  const res = await handler!(req);
  await res.body?.cancel();
  return captured!;
}

Deno.test("modo normal: corta para os últimos 8 e adiciona resumo", async () => {
  const c = await call({ messages: makeMessages(20), character: { name: "Aiko" } });
  assertEquals(c.body.messages.length, 9); // 1 system + 8 recentes
  assertEquals(c.body.messages[0].role, "system");
  assertEquals(c.body.messages[1].content, "msg-12");
  assertEquals(c.body.messages[8].content, "msg-19");
  assert(c.body.messages[0].content.includes("Memória:"), "deve conter resumo das antigas");
  assertEquals(c.body.max_tokens, 120);
});

Deno.test("modo normal: max_tokens clamped a 250", async () => {
  const c = await call({ messages: makeMessages(3), character: {}, settings: { maxTokens: 9999 } });
  assertEquals(c.body.max_tokens, 250);
});

Deno.test("modo normal: devMode só ativa com bool true (não string)", async () => {
  const c = await call({ messages: makeMessages(20), character: {}, settings: { devMode: "true" } });
  assertEquals(c.body.messages.length, 9);
  assertEquals(c.body.max_tokens, 120);
});

Deno.test("modo de testes: envia histórico completo, sem resumo, max_tokens elevado", async () => {
  const c = await call({ messages: makeMessages(20), character: {}, settings: { devMode: true, maxTokens: 1500 } });
  assertEquals(c.body.messages.length, 21); // 1 system + 20
  assertEquals(c.body.messages[1].content, "msg-0");
  assertEquals(c.body.messages[20].content, "msg-19");
  assert(!c.body.messages[0].content.includes("Memória:"), "não deve conter resumo");
  assertEquals(c.body.max_tokens, 1500);
});

Deno.test("modo de testes: max_tokens clamped a 2000", async () => {
  const c = await call({ messages: makeMessages(3), character: {}, settings: { devMode: true, maxTokens: 99999 } });
  assertEquals(c.body.max_tokens, 2000);
});

globalThis.fetch = origFetch;
