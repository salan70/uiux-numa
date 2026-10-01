// Flutter 実行基盤（platforms/flutter）の variant 一覧を生成する。
// experiments/<slug>/variants/<id>/index.dart を持つ variant を README の Variants 表の順に列挙し、その buildVariant を並べた registry.g.dart を書く。
// Dart には import.meta.glob に当たる仕組みが無いため、Web の runner と同じ責務をこの生成で補う。
// Dart はファイルごとに名前空間が分かれるので、iOS と違い名前に slug と id を含めなくてよい。
// index.dart が buildPanel も持てば、端末の枠の外に置く操作盤として一緒に渡す。
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const experiments = join(root, "experiments");
const out = join(root, "platforms/flutter/lib/registry.g.dart");

// README の Variants 表の順に並べる。比較表示（compare）の並びを、記録と同じにするため。表に無い id は後ろに辞書順で置く。
const tableOrder = (slug) => {
  const readme = join(experiments, slug, "README.md");
  if (!existsSync(readme)) return [];
  const section =
    readFileSync(readme, "utf8")
      .split(/^## Variants$/m)[1]
      ?.split(/^## /m)[0] ?? "";
  return [...section.matchAll(/^\| `([a-z0-9-]+)` +\|/gm)].map((m) => m[1]);
};

const entries = [];
for (const slug of readdirSync(experiments).sort()) {
  const variants = join(experiments, slug, "variants");
  if (!existsSync(variants)) continue;
  const order = tableOrder(slug);
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length);
  const ids = readdirSync(variants)
    .filter((id) => existsSync(join(variants, id, "index.dart")))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  for (const id of ids) {
    const source = readFileSync(join(variants, id, "index.dart"), "utf8");
    entries.push({ slug, id, panel: /^Widget buildPanel\(/m.test(source) });
  }
}

const imports = entries.map(
  (e, i) =>
    `import 'package:numa_runner/experiments/${e.slug}/variants/${e.id}/index.dart' as v${i};`,
);
const lines = entries.map(
  (e, i) =>
    `  VariantEntry('${e.slug}', '${e.id}', v${i}.buildVariant${e.panel ? `, panel: v${i}.buildPanel` : ""}),`,
);

writeFileSync(
  out,
  `// scripts/build-flutter-registry.mjs の生成物。直接編集しない。
${imports.join("\n")}

import 'variant_entry.dart';

final variantEntries = <VariantEntry>[
${lines.join("\n")}
];
`,
);
console.log(`${entries.length} 件の Flutter variant を ${out} に書いた`);
