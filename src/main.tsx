import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadAvatarAssets } from "./game/preloadAssets";

// Pré-carrega todos os retratos/emoções da Aiko no boot para evitar
// travamentos ao trocar de humor durante a conversa.
preloadAvatarAssets();

createRoot(document.getElementById("root")!).render(<App />);
