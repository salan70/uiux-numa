import 'package:flutter/material.dart';

import 'ds.dart';

// .389 の線画アイコン。製品の packages/common/design_system/assets/icons（24 の格子、線 1.5〜2.5、端と角は丸）を写す。
// 製品に無いもの（share、eye、skipNext、search、replay、flag）は、同じ格子と線の太さ（2.1）で描き足した。
// baseball の縫い目は、製品の形だと 20px で下に合流して「Y」に見えるので、左右の縁に沿う 2 本の弧に描き直した（round 5）。
// SVG を読む依存を足さないため、パスは CustomPainter で描く。読める命令は M L H V C S Q A Z（大文字と小文字）。

/// 1 本の線。d がパス、circle と rect は SVG の要素。fillBackground は製品の sliders の丸のように、線の内側を地の色で塗る。
class _Stroke {
  const _Stroke(this.d, this.width) : circle = null, radius = 0, rect = null, rx = 0, fillBackground = false;
  const _Stroke.circle(this.circle, this.radius, this.width, {this.fillBackground = false}) : d = null, rect = null, rx = 0;
  const _Stroke.rect(this.rect, this.rx, this.width) : d = null, circle = null, radius = 0, fillBackground = false;

  final String? d;
  final Offset? circle;
  final double radius;
  final Rect? rect;
  final double rx;
  final double width;
  final bool fillBackground;
}

enum DsGlyph {
  baseball([_Stroke.circle(Offset(12, 12), 8.5, 1.8), _Stroke('M8 4.4c2.1 2.1 2.1 13.1 0 15.2M16 4.4c-2.1 2.1-2.1 13.1 0 15.2', 1.6)]),
  calendar([_Stroke.rect(Rect.fromLTWH(3.5, 5.5, 17, 15), 2.2, 2.1), _Stroke('M7.5 3.5v4M16.5 3.5v4M3.7 9.5h16.6', 2.1), _Stroke('M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01', 2.8)]),
  check([_Stroke('m5.2 12.5 4.2 4.2 9.4-9.4', 2.5)]),
  chevronLeft([_Stroke('m15 5.8-6.2 6.2 6.2 6.2', 2.3)]),
  chevronRight([_Stroke('m9 5.8 6.2 6.2L9 18.2', 2.3)]),
  close([_Stroke('M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5', 2.3)]),
  crown([_Stroke('m4 8 4.2 3.2L12 5l3.8 6.2L20 8l-1.5 9.5h-13L4 8Z', 1.8), _Stroke('M5.5 20h13', 1.8)]),
  home([_Stroke('M4 10.6 12 4l8 6.6v8.1c0 .7-.6 1.3-1.3 1.3h-4.4v-5.5H9.7V20H5.3c-.7 0-1.3-.6-1.3-1.3v-8.1Z', 2.1)]),
  prohibit([_Stroke.circle(Offset(12, 12), 8.5, 1.8), _Stroke('m6.2 6.2 11.6 11.6', 1.8)]),
  link([
    _Stroke('m9.3 14.7 5.4-5.4', 2.1),
    _Stroke('m10.9 16.1-1.5 1.5a3.2 3.2 0 0 1-4.5-4.5l3.2-3.2a3.2 3.2 0 0 1 4.5 0', 2.1),
    _Stroke('m13.1 7.9 1.5-1.5a3.2 3.2 0 0 1 4.5 4.5l-3.2 3.2a3.2 3.2 0 0 1-4.5 0', 2.1),
  ]),
  settings([
    _Stroke(
      'M9.8 4.6 10.4 3h3.2l.6 1.6 1.7.7 1.5-.7 2.2 2.2-.7 1.5.7 1.7 1.6.6v3.2l-1.6.6-.7 1.7.7 1.5-2.2 2.2-1.5-.7-1.7.7-.6 1.6h-3.2l-.6-1.6-1.7-.7-1.5.7-2.2-2.2.7-1.5-.7-1.7-1.6-.6v-3.2l1.6-.6.7-1.7-.7-1.5 2.2-2.2 1.5.7 1.7-.7Z',
      1.9,
    ),
    _Stroke.circle(Offset(12, 12), 2.7, 2.1),
  ]),
  sliders([
    _Stroke('M6 4v16M12 4v16M18 4v16', 1.7),
    _Stroke.circle(Offset(6, 9), 2.1, 1.6, fillBackground: true),
    _Stroke.circle(Offset(12, 15), 2.1, 1.6, fillBackground: true),
    _Stroke.circle(Offset(18, 8), 2.1, 1.6, fillBackground: true),
  ]),
  stats([_Stroke('M5 19V12.8M10 19V8.5M15 19v-5.1M20 19V5.2', 2.4), _Stroke('M3.5 20.5h17', 2.1)]),
  // ここから下は描き足したもの。
  share([_Stroke('M8.5 9.5H7.2c-1 0-1.7.8-1.7 1.7v7.1c0 1 .8 1.7 1.7 1.7h9.6c1 0 1.7-.8 1.7-1.7v-7.1c0-1-.8-1.7-1.7-1.7h-1.3M12 3.5v10.5M8.6 6.9 12 3.5l3.4 3.4', 2.1)]),
  eye([_Stroke('M2.9 12c2.2-4 5.3-6 9.1-6s6.9 2 9.1 6c-2.2 4-5.3 6-9.1 6s-6.9-2-9.1-6Z', 2.1), _Stroke.circle(Offset(12, 12), 2.7, 2.1)]),
  skipNext([_Stroke('M6.5 6.8v10.4L13.6 12 6.5 6.8ZM17.5 6.5v11', 2.1)]),
  search([_Stroke.circle(Offset(10.5, 10.5), 6, 2.1), _Stroke('m15.2 15.2 4.8 4.8', 2.3)]),
  replay([_Stroke('M5.6 13.5A6.6 6.6 0 1 0 7.8 7M4.8 4.6v3.9h3.9', 2.1)]),
  flag([_Stroke('M6 20.5V4.5M6 5.2c3.6-1.8 5.6 1.8 9.2 0 1-.5 2-.7 2.8-.7v8.3c-.8 0-1.8.2-2.8.7-3.6 1.8-5.6-1.8-9.2 0', 2.1)]);

  const DsGlyph(this._strokes);

  final List<_Stroke> _strokes;
}

class DsIcon extends StatelessWidget {
  const DsIcon(this.glyph, {super.key, this.size = 24, this.color = DsColor.contentPrimary, this.background = DsColor.surface});

  final DsGlyph glyph;
  final double size;
  final Color color;

  /// 線の内側を塗る色（sliders の丸）。置く面の色に合わせる。
  final Color background;

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _GlyphPainter(glyph, color, background)),
    ),
  );
}

class _GlyphPainter extends CustomPainter {
  const _GlyphPainter(this.glyph, this.color, this.background);

  final DsGlyph glyph;
  final Color color;
  final Color background;

  static final _cache = <String, Path>{};

  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 24);
    for (final s in glyph._strokes) {
      final stroke = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = s.width
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;
      if (s.d != null) {
        canvas.drawPath(_cache.putIfAbsent(s.d!, () => parseSvgPath(s.d!)), stroke);
      } else if (s.circle != null) {
        if (s.fillBackground) canvas.drawCircle(s.circle!, s.radius, Paint()..color = background);
        canvas.drawCircle(s.circle!, s.radius, stroke);
      } else if (s.rect != null) {
        canvas.drawRRect(RRect.fromRectAndRadius(s.rect!, Radius.circular(s.rx)), stroke);
      }
    }
  }

  @override
  bool shouldRepaint(_GlyphPainter old) => old.glyph != glyph || old.color != color || old.background != background;
}

/// SVG のパスを読む。数の区切りは空白、カンマ、符号、2 つ目の小数点のどれでもよい。
Path parseSvgPath(String d) {
  final path = Path();
  final tokens = RegExp(r'[MmLlHhVvCcSsQqAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?').allMatches(d).map((m) => m.group(0)!).toList();
  var i = 0;
  var cur = Offset.zero;
  var start = Offset.zero;
  Offset? lastControl;
  String? cmd;
  bool isCmd(String t) => RegExp(r'^[A-Za-z]$').hasMatch(t);
  double n() => double.parse(tokens[i++]);
  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    final c = cmd!;
    final rel = c == c.toLowerCase();
    Offset pt(double x, double y) => rel ? cur + Offset(x, y) : Offset(x, y);
    switch (c.toUpperCase()) {
      case 'M':
        cur = pt(n(), n());
        start = cur;
        path.moveTo(cur.dx, cur.dy);
        // M の後に続く座標は L として読む。
        cmd = rel ? 'l' : 'L';
        lastControl = null;
      case 'L':
        cur = pt(n(), n());
        path.lineTo(cur.dx, cur.dy);
        lastControl = null;
      case 'H':
        final x = n();
        cur = Offset(rel ? cur.dx + x : x, cur.dy);
        path.lineTo(cur.dx, cur.dy);
        lastControl = null;
      case 'V':
        final y = n();
        cur = Offset(cur.dx, rel ? cur.dy + y : y);
        path.lineTo(cur.dx, cur.dy);
        lastControl = null;
      case 'C':
        final c1 = pt(n(), n());
        final c2 = pt(n(), n());
        final e = pt(n(), n());
        path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, e.dx, e.dy);
        lastControl = c2;
        cur = e;
      case 'S':
        final c1 = lastControl == null ? cur : cur * 2 - lastControl;
        final c2 = pt(n(), n());
        final e = pt(n(), n());
        path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, e.dx, e.dy);
        lastControl = c2;
        cur = e;
      case 'Q':
        final q = pt(n(), n());
        final e = pt(n(), n());
        path.quadraticBezierTo(q.dx, q.dy, e.dx, e.dy);
        lastControl = null;
        cur = e;
      case 'A':
        final rx = n();
        final ry = n();
        final rot = n();
        final large = n() != 0;
        final sweep = n() != 0;
        final e = pt(n(), n());
        path.arcToPoint(e, radius: Radius.elliptical(rx, ry), rotation: rot, largeArc: large, clockwise: sweep);
        lastControl = null;
        cur = e;
      case 'Z':
        path.close();
        cur = start;
        lastControl = null;
    }
  }
  return path;
}
