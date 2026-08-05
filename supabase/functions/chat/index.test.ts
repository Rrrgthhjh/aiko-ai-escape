import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Stub fetch ANTES de importar o módulo.
type Captured = { url: string; body: any };
let captured: Captured | null = null;
const stubFetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  captured = { url, body: JSON.parse(String(init?.body ?? "{}")) };
  const stream = new ReadableStream({
    start(c) { c.enqueue(new TextEncoder().encode("data: [DONE]\n")); c.close(); },
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}) as typeof fetch;
Object.defineProperty(globalThis, "fetch", { value: stubFetch, writable: true, configurable: true });

// Captura o handler do Deno.serve.
let handler: ((req: Request) => Promise<Response>) | null = null;
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (h: any) => {
  handler = h;
  return { finished: Promise.resolve(), shutdown: async () => {}, ref: () => {}, unref: () => {} } as any;
};

Deno.env.set("LOVABLE_API_KEY", "test-key");
await import("./index.ts");

function makeMessages(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `msg-${i}`,
  }));
}

async function call(body: unknown): Promise<Captured> {
  captured = null;
  const req = new Request("http://x/", { method: "POST", body: JSON.stringify(body) });
  const res = await handler!(req);
  await res.body?.cancel();
  if (!captured) throw new Error("fetch stub não foi chamado (status=" + res.status + ")");
  return captured;
}

Deno.test("sem limites: envia SEMPRE o histórico completo", async () => {
  const c = await call({ messages: makeMessages(40), character: { name: "Aiko" } });
  assertEquals(c.body.messages.length, 41);
  assertEquals(c.body.messages[0].role, "system");
  assertEquals(c.body.messages[1].content, "msg-0");
  assertEquals(c.body.messages[40].content, "msg-39");
  assertEquals(c.body.max_tokens, 4000);
});

Deno.test("roleplay livre: sem enredo de cativeiro nem traço possessivo fixo", async () => {
  const c = await call({ messages: makeMessages(2), character: { name: "Aiko", playerName: "Kai" } });
  const sys = c.body.messages[0].content as string;
  assert(!sys.includes("abducted"));
  assert(!sys.includes("The house is YOURS"));
  assert(sys.includes("no plot"));
  assert(!sys.toLowerCase().includes("captivity"));
  assert(sys.includes("NEVER forget"));
});

Deno.test("local público: regras de recusa a ações íntimas na rua", async () => {
  const c = await call({ messages: makeMessages(2), character: {}, room: "fast-food" });
  const sys = c.body.messages[0].content as string;
  assert(sys.includes("PUBLIC PLACE RULES"));
  assert(sys.includes("praça") || sys.includes("food court") || sys.includes("shopping"));
});

Deno.test("dentro de casa: regras privadas, sem restrição de local público", async () => {
  const c = await call({ messages: makeMessages(2), character: {}, room: "quarto" });
  const sys = c.body.messages[0].content as string;
  assert(sys.includes("PRIVATE RULES"));
  assert(!sys.includes("PUBLIC PLACE RULES"));
});

Deno.test("não existe memória de conversas anteriores", async () => {
  const c = await call({
    messages: makeMessages(2),
    character: {},
    impressions: ["ela guarda uma ferida antiga"],
  });
  const sys = c.body.messages[0].content as string;
  assert(!sys.includes("LINGERING IMPRESSIONS"));
  assert(!sys.includes("ela guarda uma ferida antiga"));
});
