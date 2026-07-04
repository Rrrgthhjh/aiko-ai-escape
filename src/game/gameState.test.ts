import { describe, it, expect } from "vitest";
import { analyzeGameState } from "./gameState";
import type { ChatMessage } from "./types";

const msg = (content: string, role: "user" | "assistant" = "user"): ChatMessage => ({
  id: Math.random().toString(36),
  role,
  content,
  ts: Date.now(),
});

describe("analyzeGameState — gatilhos e confiança para o overlay", () => {
  it("detecta shy e expõe as palavras que dispararam", () => {
    const s = analyzeGameState([msg("você é fofa e linda")], 0);
    expect(s.mood).toBe("shy");
    expect(s.triggers).toEqual(expect.arrayContaining(["fofa", "linda"]));
    expect(s.confidence).toBeGreaterThan(30);
  });

  it("prioriza a última fala do usuário para trocar o humor", () => {
    const s = analyzeGameState(
      [msg("você é linda"), msg("haha que engraçado")],
      0,
    );
    expect(s.mood).toBe("happy");
    expect(s.triggers.some((t) => "haha".includes(t) || t.includes("haha") || t.includes("engraçad"))).toBe(true);
  });

  it("retorna triggers vazio e mood calm quando não há sinais", () => {
    const s = analyzeGameState([msg("oi")], 0);
    expect(s.mood).toBe("calm");
    expect(s.triggers).toEqual([]);
  });
});