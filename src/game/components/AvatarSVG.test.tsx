import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { act } from "react";
import AvatarSVG from "./AvatarSVG";
import { DEFAULT_CHARACTER } from "../types";

afterEach(() => {
  vi.useRealTimers();
});

describe("AvatarSVG", () => {
  it("aplica a classe de gesto correspondente ao humor", () => {
    const { container, rerender } = render(
      <AvatarSVG character={DEFAULT_CHARACTER} mood="calm" />,
    );
    const wrapperClass = () => (container.firstElementChild as HTMLElement).className;
    expect(wrapperClass()).not.toMatch(/animate-gesture-/);

    rerender(<AvatarSVG character={DEFAULT_CHARACTER} mood="shy" />);
    expect(wrapperClass()).toMatch(/animate-gesture-shy-sway/);

    rerender(<AvatarSVG character={DEFAULT_CHARACTER} mood="angry" />);
    expect(wrapperClass()).toMatch(/animate-gesture-shake/);

    rerender(<AvatarSVG character={DEFAULT_CHARACTER} mood="crying" />);
    expect(wrapperClass()).toMatch(/animate-gesture-tremble/);

    rerender(<AvatarSVG character={DEFAULT_CHARACTER} mood="happy" />);
    expect(wrapperClass()).toMatch(/animate-gesture-bounce/);
  });

  it("faz crossfade: mantém imagem anterior visível ao trocar de humor e remove após 600ms", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <AvatarSVG character={DEFAULT_CHARACTER} mood="happy" />,
    );
    // primeira renderização: apenas 1 <img>
    expect(container.querySelectorAll("img").length).toBe(1);
    const firstSrc = container.querySelector("img")!.getAttribute("src");

    rerender(<AvatarSVG character={DEFAULT_CHARACTER} mood="sad" />);
    // durante o crossfade: 2 <img> (anterior + atual)
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    // a primeira é a anterior (aria-hidden) e mantém o src antigo
    expect(imgs[0].getAttribute("aria-hidden")).not.toBeNull();
    expect(imgs[0].getAttribute("src")).toBe(firstSrc);
    // a segunda tem a nova imagem, com a classe de fade
    expect(imgs[1].getAttribute("src")).not.toBe(firstSrc);
    expect(imgs[1].className).toMatch(/animate-mood-fade/);

    // após 600ms a imagem anterior é removida
    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(container.querySelectorAll("img").length).toBe(1);
  });
});