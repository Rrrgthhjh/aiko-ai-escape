import { describe, it, expect } from "vitest";
import { detectMoodFromMessage, detectRoomFromActions } from "./actionParser";

describe("autorizador contextual de emoções", () => {
  it("entende negação: 'o sorriso desaparece' NÃO é feliz", () => {
    const r = detectMoodFromMessage("*o sorriso dela desaparece instantaneamente*");
    expect(r?.mood).not.toBe("happy");
    expect(r?.mood).toBe("sad");
  });

  it("detecta intensidade baixa: sorriso pequeno", () => {
    expect(detectMoodFromMessage("*esboça um sorriso pequeno*")?.mood).toBe("happySlight");
  });

  it("detecta uma lágrima solitária", () => {
    expect(detectMoodFromMessage("*uma lágrima solitária escorre*")?.mood).toBe("tearSingle");
  });

  it("lê a mensagem inteira, não só as ações", () => {
    expect(detectMoodFromMessage("*se encolhe assustada*")?.mood).toBeTruthy();
  });
});

describe("autorizador de locais", () => {
  it("reconhece novos sub-locais", () => {
    expect(detectRoomFromActions(["te leva até a beira do lago"])).toBe("lago");
    expect(detectRoomFromActions(["entra na praça de alimentação"])).toBe("fast-food");
  });

  it("cai no primeiro sub-local ao citar só o local macro", () => {
    expect(detectRoomFromActions(["caminha com você pelo shopping"])).toBe("loja-de-roupas");
  });
});
describe("cobertura ampliada de ações", () => {
  it("detecta ações em itálico com underscore", () => {
    expect(detectMoodFromMessage("_ela sorri animada_")?.mood).toBe("happy");
  });
  it("detecta ações entre parênteses", () => {
    expect(detectMoodFromMessage("(fica com medo e se encolhe)")?.mood).toBe("scared");
  });
  it("detecta adjetivos simples de emoção", () => {
    expect(detectMoodFromMessage("*fica irritada com você*")?.mood).toBeTruthy();
  });
  it("detecta asterisco aberto sem fechar", () => {
    expect(detectMoodFromMessage("oi... *ela cora um pouco")?.mood).toBeTruthy();
  });
});
