import { lazy, StrictMode, Suspense, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "./preview.css";

const modules = import.meta.glob<{ default: ComponentType }>(
  "../../../experiments/*/variants/*/index.tsx",
);

const match = window.location.pathname.match(/^\/preview\/([^/]+)\/([^/]+)\/?$/);
const selected = match
  ? Object.entries(modules).find(([key]) =>
      key.endsWith(`/experiments/${match[1]}/variants/${match[2]}/index.tsx`),
    )
  : undefined;

const Variant = selected ? lazy(selected[1]) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="preview-root">
      {Variant ? (
        <Suspense fallback={<p>読み込み中</p>}>
          <Variant />
        </Suspense>
      ) : (
        <p>指定されたバリアントは見つかりません。</p>
      )}
    </main>
  </StrictMode>,
);
