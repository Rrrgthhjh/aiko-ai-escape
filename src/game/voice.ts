/** Utilitários de voz: extrai idade da personalidade e monta instruções de TTS. */

export function extractAgeFromText(text: string): number | null {
  const t = (text || "").toLowerCase();
  const m = t.match(/(\d{1,3})\s*(anos?|años?|years?\s*old|years?|ans|jahre|anni)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 120) return n;
  }
  if (/\b(beb[êe]|bebezinh[ao])\b/.test(t)) return 3;
  if (/\b(crian[çc]a|garotinh[ao]|menin[ao] pequen[ao]|kid|child)\b/.test(t)) return 8;
  if (/\b(pr[eé]-adolescente|preteen)\b/.test(t)) return 12;
  if (/\b(adolescente|teenager|teen)\b/.test(t)) return 16;
  if (/\b(jovem adulta|young woman)\b/.test(t)) return 22;
  if (/\b(adulta|adult)\b/.test(t)) return 30;
  if (/\b(meia[- ]idade|middle[- ]aged)\b/.test(t)) return 45;
  if (/\b(idosa|idoso|velha|velhinha|anci[ãa]|vov[óo]|elderly|old woman)\b/.test(t)) return 72;
  return null;
}

export type VoiceProfile = {
  voice: "alloy" | "shimmer" | "nova" | "coral" | "sage" | "verse" | "fable";
  instructions: string;
  speed: number;
};

/** Mapeia idade → perfil de voz feminina. Sem idade: adulta jovem (~20). */
export function voiceProfileForAge(age: number | null): VoiceProfile {
  if (age === null) {
    return {
      voice: "shimmer",
      speed: 1.0,
      instructions:
        "Voz feminina, jovem adulta de aproximadamente 20 anos. Tom quente, natural, expressivo e íntimo. Fala com carinho suave e leve tensão emocional, como uma personagem de visual novel psicológica.",
    };
  }
  if (age <= 6) {
    return {
      voice: "coral",
      speed: 1.15,
      instructions:
        "Voz de criança pequena, muito aguda e doce, entonação infantil, com pausas curtas e vocabulário simples. Fala inocente e curiosa.",
    };
  }
  if (age <= 11) {
    return {
      voice: "nova",
      speed: 1.1,
      instructions:
        "Voz de menina de escola primária, aguda e leve, energética e brincalhona. Frases curtas, vocabulário simples.",
    };
  }
  if (age <= 17) {
    return {
      voice: "nova",
      speed: 1.05,
      instructions:
        "Voz de adolescente, brilhante e jovem, um pouco insegura e emotiva. Entonação animada com toques dramáticos.",
    };
  }
  if (age <= 30) {
    return {
      voice: "shimmer",
      speed: 1.0,
      instructions:
        "Voz de jovem mulher adulta, quente, expressiva e íntima. Fala natural e feminina, com carinho contido.",
    };
  }
  if (age <= 55) {
    return {
      voice: "sage",
      speed: 0.98,
      instructions:
        "Voz de mulher adulta madura, calma e articulada, entonação firme e serena, vocabulário refinado.",
    };
  }
  return {
    voice: "fable",
    speed: 0.9,
    instructions:
      "Voz de senhora idosa, ligeiramente rouca e trêmula, cadência mais lenta, tom caloroso de avó. Vocabulário rico, sotaque suave e frases mais elaboradas. Bem caricata da idade avançada.",
  };
}