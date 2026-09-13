import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// experiments/ 配下の variant を読むため、リポジトリルートまで配信を許可する。
const repoRoot = new URL("../..", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
