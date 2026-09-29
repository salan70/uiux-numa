// 数の表記。Japanese Notation（adopted）と、製品の ui_ux_concepts.md の contentRules を合わせた。
// 打率、出塁率、長打率、OPS は 3 桁で、1 未満は野球の慣習どおり先頭の 0 を省く（.312）。
// 年俸は contentRules の「万円、区切りなし」より Japanese Notation の「1,000 件」を優先し、億で区切る。

String rate(double? value) {
  if (value == null) return '---';
  final fixed = value.toStringAsFixed(3);
  return value < 1 ? fixed.substring(1) : fixed;
}

String signedRate(double delta) {
  final sign = delta >= 0 ? '+' : '−';
  return '$sign${rate(delta.abs())}';
}

String grouped(int value) {
  final s = value.abs().toString();
  final b = StringBuffer(value < 0 ? '−' : '');
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
    b.write(s[i]);
  }
  return b.toString();
}

/// 年俸（万円）を「1 億 2,000 万円」「800 万円」にする。
String salary(int manYen) {
  final oku = manYen ~/ 10000;
  final man = manYen % 10000;
  if (oku == 0) return '${grouped(man)} 万円';
  if (man == 0) return '$oku 億円';
  return '$oku 億 ${grouped(man)} 万円';
}

String year(int y) => '$y 年';
