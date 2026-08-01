import { describe, it, expect } from "vitest";
import { AVATAR_ASSETS, preloadAvatarAssets } from "./preloadAssets";

describe("preloadAvatarAssets", () => {
  it("inclui todas as 10 emoções + retrato base + variantes + fusões (24 no total)", () => {
    expect(AVATAR_ASSETS.length).toBe(32);
    // Deve conter cada mood key esperado (via substring do path)
    for (const key of [
      "mood-shy", "mood-happy", "mood-sad", "mood-surprised", "mood-crying", "mood-angry",
      "mood-blush", "mood-flirty", "mood-scared", "mood-sleepy", "portrait",
      "mood-crying-happy", "mood-blush-flirty", "mood-happy-shy",
      "mood-scared-sad", "mood-surprised-happy", "mood-angry-crying",
    ]) {
      expect(AVATAR_ASSETS.some((src) => src.includes(key))).toBe(true);
    }
  });

  it("pré-carrega criando <Image> para cada asset e é idempotente", async () => {
    const created: string[] = [];
    const OriginalImage = globalThis.Image;
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decoding = "";
      set src(v: string) {
        created.push(v);
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error override
    globalThis.Image = MockImage;
    try {
      await preloadAvatarAssets();
      const firstCount = created.length;
      expect(firstCount).toBe(AVATAR_ASSETS.length);
      // Segunda chamada é no-op (idempotente)
      await preloadAvatarAssets();
      expect(created.length).toBe(firstCount);
    } finally {
      globalThis.Image = OriginalImage;
    }
  });
});