
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // When Vercel redeploys, old chunk hashes become invalid. Intercept the
  // dynamic import error and reload once so the browser picks up the new build.
  globalThis.addEventListener("vite:preloadError", () => {
    globalThis.location.reload();
  });

  createRoot(document.getElementById("root")!).render(<App />);
  