import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MoodOverlay from "./MoodOverlay";
import { MOOD_LABELS } from "../gameState";

describe("MoodOverlay", () => {
  it("mostra o label do humor, a confiança e as últimas palavras-gatilho", () => {
    render(<MoodOverlay mood="shy" confidence={72} triggers={["fofa", "linda", "amo você"]} />);
    expect(screen.getByText(MOOD_LABELS.shy)).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("fofa")).toBeInTheDocument();
    expect(screen.getByText("linda")).toBeInTheDocument();
    expect(screen.getByText("amo você")).toBeInTheDocument();
  });

  it("mostra fallback quando não há gatilhos", () => {
    render(<MoodOverlay mood="calm" confidence={10} triggers={[]} />);
    expect(screen.getByText(/sem gatilho recente/i)).toBeInTheDocument();
  });

  it("limita a exibição às últimas 4 palavras-gatilho", () => {
    render(
      <MoodOverlay
        mood="happy"
        confidence={80}
        triggers={["a", "b", "c", "d", "e", "f"]}
      />,
    );
    // primeiros dois foram cortados
    expect(screen.queryByText("a")).toBeNull();
    expect(screen.queryByText("b")).toBeNull();
    for (const t of ["c", "d", "e", "f"]) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });
});