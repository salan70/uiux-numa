import 'package:flutter/material.dart';

import 'model.dart';

// ドット絵の選手と、電光掲示板の 5×7 のドット文字。
// 製品の UI/UX 方針（ui_ux_concepts の P-001）の「ピクセル風・ドット風の要素」を、画像を使わずに矩形で描く。
// 形の正本は experiments/baseball-journey-reel/variants/diamond-loop/sprites.ts で、ここはその写し。

/// 夜の球場と電光掲示板の色。明暗の設定に依らず暗い面にする（README の B1 と同じ扱い）。
abstract final class Night {
  static const field = Color(0xFF0F2A1C);
  static const stripe = Color(0xFF133523);
  static const board = Color(0xFF06150D);
  static const ledOn = Color(0xFFFAC400);
  static const ledOff = Color(0xFF15321F);
  static const ink = Color(0xFFF4F1E6);
}

/// 16×16 の選手の胸像。1 字が 1 画素で、`.` は透明。
/// k: 輪郭、c: 帽子と胸の番号（球団の色）、b: つば、w: 帽子の印、s: 肌、e: 目、p: 頬、m: 口、u: ユニフォーム。
const _sprite = [
  '................',
  '.....kkkkkk.....',
  '....kcccccck....',
  '...kcccwwccck...',
  '...kcccccccck...',
  '...kbbbbbbbbbbk.',
  '...kssssssssk...',
  '...ksesssessk...',
  '...kpssssspsk...',
  '...ksssmmsssk...',
  '....kssssssk....',
  '......kssk......',
  '...kkuuuuuukk...',
  '..kuuuunnuuuuk..',
  '.kuuuuunnuuuuuk.',
  '.kuuuuunnuuuuuk.',
];

const _skins = [
  Color(0xFFF8DCC0),
  Color(0xFFF5CFA8),
  Color(0xFFE8B48A),
  Color(0xFFC98D62),
  Color(0xFFA86D45),
  Color(0xFF7A4B2E),
];

/// 髪の色。黒、茶、金、赤、白。
const hairColors = [Color(0xFF231A14), Color(0xFF6B4226), Color(0xFFE2B640), Color(0xFFB4442A), Color(0xFFE9E6DF)];
const skinColors = _skins;

/// 顔の部品を、基の胸像に重ねる（D-37）。h: 髪とひげ、g: 眼鏡の枠、q: レンズの光、l: 色の付いたレンズ、x: 無精ひげ。
/// 顔は 4〜11 列、目は 7 行目の 5 列と 9 列、口は 9 行目。帽子のつばの下の 6 行目に眉と前髪を置く。
List<String> faceSprite(Face face) {
  final rows = [for (final r in _sprite) r.split('')];
  void set(int y, int x, String c) => rows[y][x] = c;
  switch (face.hair) {
    case HairStyle.shaved:
      break;
    case HairStyle.sideburns:
      for (final (y, x) in const [(6, 4), (7, 4), (6, 11), (7, 11)]) {
        set(y, x, 'h');
      }
    case HairStyle.bangs:
      for (final (y, x) in const [(6, 4), (6, 6), (6, 7), (6, 8), (6, 11)]) {
        set(y, x, 'h');
      }
    case HairStyle.long:
      for (var y = 6; y <= 9; y++) {
        set(y, 3, 'h');
        set(y, 12, 'h');
        set(y, 2, 'k');
        set(y, 13, 'k');
      }
      set(10, 4, 'h');
      set(10, 11, 'h');
      set(10, 3, 'k');
      set(10, 12, 'k');
  }
  switch (face.brow) {
    case Brow.none:
      break;
    case Brow.thin:
      set(6, 5, 'h');
      set(6, 9, 'h');
    case Brow.thick:
      for (final x in const [4, 5, 9, 10]) {
        set(6, x, 'h');
      }
  }
  switch (face.eyes) {
    case Eyes.dot:
      break;
    case Eyes.narrow:
      set(7, 6, 'e');
      set(7, 10, 'e');
    case Eyes.round:
      set(8, 5, 'e');
      set(8, 9, 'e');
  }
  if (face.beard == Beard.mustache || face.beard == Beard.full) {
    for (var x = 6; x <= 9; x++) {
      set(8, x, 'h');
    }
  }
  if (face.beard == Beard.chin || face.beard == Beard.full) {
    for (var x = 5; x <= 10; x++) {
      set(10, x, 'h');
    }
    set(11, 7, 'h');
    set(11, 8, 'h');
  }
  if (face.beard == Beard.stubble) {
    for (final (y, x) in const [(9, 5), (9, 10), (10, 6), (10, 9)]) {
      set(y, x, 'x');
    }
  }
  switch (face.glasses) {
    case Glasses.none:
      break;
    case Glasses.glasses:
      // 1 画素の目は枠と見分けられないので、目の位置にレンズの光を置く。
      for (final x in const [4, 6, 7, 8, 10]) {
        set(7, x, 'g');
      }
      set(7, 5, 'q');
      set(7, 9, 'q');
    case Glasses.sunglasses:
      for (final x in const [4, 5, 6, 8, 9, 10]) {
        set(7, x, 'l');
      }
      set(7, 7, 'g');
  }
  return [for (final r in rows) r.join()];
}
const _ink = Color(0xFF120D09);
const _paper = Color(0xFFFFFDF9);
const _grey = Color(0xFF9EA19F);

/// 球団の色。固定データの 4 球団は pop-toy の役割と緑に割り当て、それ以外は名前から決める。
Color teamColor(Team team) {
  const known = {
    '北斗ライナーズ': Color(0xFF4078E0),
    '湾岸ドルフィンズ': Color(0xFFF37252),
    '青葉スターズ': Color(0xFF2E8B57),
    'サンセット・ウェーブス': Color(0xFFFAC400),
  };
  const others = [Color(0xFF4078E0), Color(0xFFF37252), Color(0xFFFAC400), Color(0xFF2E8B57), _ink];
  return known[team.name] ?? others[_stableHash(team.name) % others.length];
}

int _stableHash(String s) => s.codeUnits.fold(7, (h, c) => (h * 31 + c) & 0x7fffffff);

/// 選手ごとの配色。肌と髪は顔の部品から決める。引退した選手は帽子を灰にする。
Map<String, Color> playerPalette(Player player, {Face? face, Team? team}) => facePalette(
  face ?? player.face,
  player.isActive ? teamColor(team ?? player.current.team) : _grey,
);

Map<String, Color> facePalette(Face face, Color team) {
  final skin = _skins[face.skin % _skins.length];
  return {
    'k': _ink,
    'c': team,
    'b': Color.lerp(team, _ink, 0.45)!,
    'w': team == const Color(0xFFFAC400) ? _ink : _paper,
    's': skin,
    'h': hairColors[face.hairColor % hairColors.length],
    'g': _ink,
    'l': const Color(0xFF1E2A3A),
    'q': const Color(0xFFCFE6F2),
    'x': Color.lerp(skin, _ink, 0.25)!,
    'e': _ink,
    'p': const Color(0xFFF39A82),
    'm': const Color(0xFFB5452E),
    'u': _paper,
    'n': team,
  };
}

/// ドット絵の選手。reveal が 1 未満の間は、画素が下の行から降りてくる（選手を初めて見せるとき）。
class PixelAvatar extends StatelessWidget {
  const PixelAvatar({super.key, required this.player, this.size = 64, this.reveal = 1, this.season});

  final Player player;
  final double size;
  final double reveal;

  /// その季の顔と球団で描く。無ければ今の季。
  final Season? season;

  @override
  Widget build(BuildContext context) {
    final face = (season ?? player.current).face;
    return ExcludeSemantics(
      child: CustomPaint(
        size: Size.square(size),
        painter: _AvatarPainter(playerPalette(player, face: face, team: season?.team), faceSprite(face), reveal),
      ),
    );
  }
}

/// 選手が決まる前（作成の途中）の顔。球団の色を直接渡す。
class FaceAvatar extends StatelessWidget {
  const FaceAvatar({super.key, required this.face, required this.team, this.size = 96});

  final Face face;
  final Color team;
  final double size;

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: CustomPaint(size: Size.square(size), painter: _AvatarPainter(facePalette(face, team), faceSprite(face), 1)),
  );
}

class _AvatarPainter extends CustomPainter {
  _AvatarPainter(this.colors, this.sprite, this.reveal);

  final Map<String, Color> colors;
  final List<String> sprite;
  final double reveal;

  @override
  void paint(Canvas canvas, Size size) {
    final px = size.width / 16;
    final paint = Paint()..isAntiAlias = false;
    for (var y = 0; y < 16; y++) {
      for (var x = 0; x < 16; x++) {
        final color = colors[sprite[y][x]];
        if (color == null) continue;
        var dy = 0.0;
        if (reveal < 1) {
          // 下の行から順に降らせ、画素ごとに少しずらす。1 画素の落下は全体の 35%。
          final start = (15 - y) / 15 * 0.55 + _jitter(x, y) * 0.1;
          final p = ((reveal - start) / 0.35).clamp(0.0, 1.0);
          if (p <= 0) continue;
          dy = -size.height * 1.4 * (1 - Curves.easeOutBack.transform(p));
        }
        paint.color = color;
        canvas.drawRect(Rect.fromLTWH(x * px, y * px + dy, px + 0.5, px + 0.5), paint);
      }
    }
  }

  double _jitter(int x, int y) {
    final v = (x * 73 + y * 151) % 97;
    return v / 97;
  }

  @override
  bool shouldRepaint(_AvatarPainter old) => old.reveal != reveal || old.colors != colors || old.sprite != sprite;
}

// 5×7 のドット文字。`#` が点灯する。電光掲示板の英数字だけに使い、日本語は LINE Seed JP で組む。
const _glyphs = <String, List<String>>{
  'A': [' ### ', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
  'B': ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
  'C': [' ### ', '#   #', '#    ', '#    ', '#    ', '#   #', ' ### '],
  'D': ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
  'E': ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#####'],
  'F': ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#    '],
  'G': [' ### ', '#   #', '#    ', '# ###', '#   #', '#   #', ' ####'],
  'H': ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
  'I': [' ### ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
  'J': ['  ###', '   # ', '   # ', '   # ', '   # ', '#  # ', ' ##  '],
  'K': ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
  'L': ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
  'M': ['#   #', '## ##', '# # #', '# # #', '#   #', '#   #', '#   #'],
  'N': ['#   #', '#   #', '##  #', '# # #', '#  ##', '#   #', '#   #'],
  'O': [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  'P': ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
  'R': ['#### ', '#   #', '#   #', '#### ', '# #  ', '#  # ', '#   #'],
  'S': [' ####', '#    ', '#    ', ' ### ', '    #', '    #', '#### '],
  'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
  'U': ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  'V': ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
  'W': ['#   #', '#   #', '#   #', '# # #', '# # #', '# # #', ' # # '],
  'Y': ['#   #', '#   #', ' # # ', '  #  ', '  #  ', '  #  ', '  #  '],
  '0': [' ### ', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ### '],
  '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
  '2': [' ### ', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
  '3': ['#####', '   # ', '  #  ', '   # ', '    #', '#   #', ' ### '],
  '4': ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
  '5': ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
  '6': ['  ## ', ' #   ', '#    ', '#### ', '#   #', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', ' #   ', ' #   ', ' #   '],
  '8': [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
  '9': [' ### ', '#   #', '#   #', ' ####', '    #', '   # ', ' ##  '],
  '.': ['     ', '     ', '     ', '     ', '     ', ' ##  ', ' ##  '],
  '/': ['     ', '    #', '   # ', '  #  ', ' #   ', '#    ', '     '],
  '!': ['  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '     ', '  #  '],
  '-': ['     ', '     ', '     ', '#####', '     ', '     ', '     '],
  '+': ['     ', '  #  ', '  #  ', '#####', '  #  ', '  #  ', '     '],
  ' ': ['     ', '     ', '     ', '     ', '     ', '     ', '     '],
};

/// ドット文字の幅（点の数）。字の間は 1 点あける。
int dotColumns(String text) => text.isEmpty ? 0 : text.length * 6 - 1;

/// 電光掲示板のドット文字。lit は左から点灯した割合（0〜1）で、読み上げには label を渡す。
class DotText extends StatelessWidget {
  const DotText(
    this.lines, {
    super.key,
    required this.pitch,
    this.color = Night.ledOn,
    this.offColor,
    this.lit = 1,
    this.label,
    this.lineGap = 2,
  });

  final List<String> lines;
  final double pitch;
  final Color color;

  /// 消えている点の色。null なら消えた点を描かない。
  final Color? offColor;
  final double lit;
  final String? label;
  final int lineGap;

  @override
  Widget build(BuildContext context) {
    final cols = lines.fold(0, (m, l) => dotColumns(l) > m ? dotColumns(l) : m);
    final rows = lines.length * 7 + (lines.length - 1) * lineGap;
    final paint = CustomPaint(
      size: Size(cols * pitch, rows * pitch),
      painter: _DotPainter(lines, pitch, color, offColor, lit, cols, lineGap),
    );
    return Semantics(label: label ?? lines.join(' '), excludeSemantics: true, child: paint);
  }
}

class _DotPainter extends CustomPainter {
  _DotPainter(this.lines, this.pitch, this.color, this.offColor, this.lit, this.cols, this.lineGap);

  final List<String> lines;
  final double pitch;
  final Color color;
  final Color? offColor;
  final double lit;
  final int cols;
  final int lineGap;

  @override
  void paint(Canvas canvas, Size size) {
    final dot = pitch * 0.74;
    final on = Paint()
      ..color = color
      ..isAntiAlias = false;
    final halo = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..isAntiAlias = false;
    // 消えた点は升目の全体に敷き、掲示板の面にする。
    if (offColor != null) {
      final off = Paint()
        ..color = offColor!
        ..isAntiAlias = false;
      final rows = (size.height / pitch).round();
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          canvas.drawRect(Rect.fromLTWH(c * pitch, r * pitch, dot, dot), off);
        }
      }
    }
    for (var li = 0; li < lines.length; li++) {
      final text = lines[li].toUpperCase();
      final width = dotColumns(text);
      final ox = ((cols - width) / 2).floorToDouble();
      final oy = li * (7 + lineGap).toDouble();
      for (var i = 0; i < text.length; i++) {
        final glyph = _glyphs[text[i]] ?? _glyphs[' ']!;
        for (var r = 0; r < 7; r++) {
          for (var c = 0; c < 5; c++) {
            final col = ox + i * 6 + c;
            // 左から点灯する。行ごとに少し遅らせ、掲示板の走査に見せる。
            final shown = glyph[r][c] == '#' && (col + li * 3) / (cols + lines.length * 3) < lit;
            if (!shown) continue;
            final rect = Rect.fromLTWH(col * pitch, (oy + r) * pitch, dot, dot);
            canvas.drawRect(rect.inflate(pitch * 0.18), halo);
            canvas.drawRect(rect, on);
          }
        }
      }
    }
  }

  @override
  bool shouldRepaint(_DotPainter old) => old.lit != lit || old.lines != lines || old.color != color;
}
