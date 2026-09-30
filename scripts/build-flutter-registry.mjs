// Flutter 実行基盤（platforms/flutter）の variant 一覧を生成する。
// experiments/<slug>/variants/<id>/index.dart を持つ variant を列挙し、その buildVariant を並べた registry.g.dart を書く。
// Dart には import.meta.glob に当たる仕組みが無いため、Web の runner と同じ責務をこの生成で補う。
// Dart はファイルごとに名前空間が分かれるので、iOS と違い名前に slug と id を含めなくてよい。
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const experiments = join(root, "experiments");
const out = join(root, "platforms/flutter/lib/registry.g.dart");

const entries = [];
for (const slug of readdirSync(experiments).sort()) {
  const variants = join(experiments, slug, "variants");
  if (!existsSync(variants)) continue;
  for (const id of readdirSync(variants).sort()) {
    if (!existsSync(join(variants, id, "index.dart"))) continue;
    entries.push({ slug, id });
  }
}

const imports = entries.map(
  (e, i) =>
    `import 'package:numa_runner/experiments/${e.slug}/variants/${e.id}/index.dart' as v${i};`,
);
const lines = entries.map((e, i) => `  VariantEntry('${e.slug}', '${e.id}', v${i}.buildVariant),`);

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
