/** Lista de idiomas selecionáveis para a IA (ordem alfabética por rótulo em PT-BR). */
export type LanguageOption = { code: string; label: string; native: string };

const RAW: LanguageOption[] = [
  { code: "af", label: "Africâner", native: "Afrikaans" },
  { code: "de", label: "Alemão", native: "Deutsch" },
  { code: "ar", label: "Árabe", native: "العربية" },
  { code: "hy", label: "Armênio", native: "Հայերեն" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "bg", label: "Búlgaro", native: "Български" },
  { code: "ca", label: "Catalão", native: "Català" },
  { code: "kk", label: "Cazaque", native: "Қазақша" },
  { code: "zh-CN", label: "Chinês (simplificado)", native: "简体中文" },
  { code: "zh-TW", label: "Chinês (tradicional)", native: "繁體中文" },
  { code: "ko", label: "Coreano", native: "한국어" },
  { code: "hr", label: "Croata", native: "Hrvatski" },
  { code: "da", label: "Dinamarquês", native: "Dansk" },
  { code: "sk", label: "Eslovaco", native: "Slovenčina" },
  { code: "sl", label: "Esloveno", native: "Slovenščina" },
  { code: "es", label: "Espanhol", native: "Español" },
  { code: "et", label: "Estoniano", native: "Eesti" },
  { code: "fi", label: "Finlandês", native: "Suomi" },
  { code: "fr", label: "Francês", native: "Français" },
  { code: "gl", label: "Galego", native: "Galego" },
  { code: "cy", label: "Galês", native: "Cymraeg" },
  { code: "el", label: "Grego", native: "Ελληνικά" },
  { code: "he", label: "Hebraico", native: "עברית" },
  { code: "hi", label: "Híndi", native: "हिन्दी" },
  { code: "nl", label: "Holandês", native: "Nederlands" },
  { code: "hu", label: "Húngaro", native: "Magyar" },
  { code: "id", label: "Indonésio", native: "Bahasa Indonesia" },
  { code: "en", label: "Inglês", native: "English" },
  { code: "it", label: "Italiano", native: "Italiano" },
  { code: "ja", label: "Japonês", native: "日本語" },
  { code: "lv", label: "Letão", native: "Latviešu" },
  { code: "lt", label: "Lituano", native: "Lietuvių" },
  { code: "ms", label: "Malaio", native: "Bahasa Melayu" },
  { code: "no", label: "Norueguês", native: "Norsk" },
  { code: "fa", label: "Persa", native: "فارسی" },
  { code: "pl", label: "Polonês", native: "Polski" },
  { code: "pt-BR", label: "Português (Brasil)", native: "Português brasileiro" },
  { code: "pt-PT", label: "Português (Portugal)", native: "Português europeu" },
  { code: "ro", label: "Romeno", native: "Română" },
  { code: "ru", label: "Russo", native: "Русский" },
  { code: "sr", label: "Sérvio", native: "Српски" },
  { code: "sw", label: "Suaíli", native: "Kiswahili" },
  { code: "sv", label: "Sueco", native: "Svenska" },
  { code: "tl", label: "Tagalo", native: "Tagalog" },
  { code: "th", label: "Tailandês", native: "ไทย" },
  { code: "ta", label: "Tâmil", native: "தமிழ்" },
  { code: "cs", label: "Tcheco", native: "Čeština" },
  { code: "tr", label: "Turco", native: "Türkçe" },
  { code: "uk", label: "Ucraniano", native: "Українська" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "vi", label: "Vietnamita", native: "Tiếng Việt" },
];

export const LANGUAGES: LanguageOption[] = [...RAW].sort((a, b) =>
  a.label.localeCompare(b.label, "pt-BR"),
);

export const DEFAULT_LANGUAGE = "pt-BR";

export function findLanguage(code?: string): LanguageOption {
  return (
    LANGUAGES.find((l) => l.code === code) ??
    LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!
  );
}

/** Rótulo enviado à IA, ex.: "pt-BR (Português brasileiro)". */
export function languagePrompt(code?: string): string {
  const l = findLanguage(code);
  return `${l.code} (${l.native})`;
}

/** Normaliza busca (sem acentos, minúsculas). */
export function normalizeSearch(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}