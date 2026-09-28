// iOS 実行基盤（platforms/ios）の variant 一覧を生成する。
// experiments/<slug>/variants/<id>/<Pascal(slug)><Pascal(id)>.swift を持つ variant を列挙し、
// その名前の型を並べた Registry.generated.swift を書く。
// 全 Experiment の Swift は 1 つの module に入り、ファイル名も型名も重複できない。そのため名前に slug と id を含める。
// Swift には import.meta.glob に当たる仕組みが無いため、Web の runner と同じ責務をこの生成で補う。
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const experiments = join(root, "experiments");
const out = join(root, "platforms/ios/Runner/Registry.generated.swift");

const pascal = (kebab) =>
  kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const entries = [];
for (const slug of readdirSync(experiments).sort()) {
  const variants = join(experiments, slug, "variants");
  if (!existsSync(variants)) continue;
  for (const id of readdirSync(variants).sort()) {
    const type = pascal(slug) + pascal(id);
    if (!existsSync(join(variants, id, `${type}.swift`))) continue;
    entries.push({ slug, id, type });
  }
}

const lines = entries.map(
  (e) => `    VariantEntry(experiment: "${e.slug}", variant: "${e.id}") { AnyView(${e.type}()) },`,
);

writeFileSync(
  out,
  `// scripts/build-ios-registry.mjs の生成物。直接編集しない。
import SwiftUI

@MainActor
let variantEntries: [VariantEntry] = [
${lines.join("\n")}
]
`,
);
console.log(`${entries.length} 件の iOS variant を ${out} に書いた`);
