import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'ds.dart';

// 紙吹雪。紙の落ち方に寄せて、次の 4 つで動かす。
// - 打ち上げ: 正解の札から、上向きの扇（-160°〜-20°）へ速さをばらつかせて飛ばす。真下へは飛ばさない。
// - 空気抵抗: 速さに比例する抵抗（係数 k）を入れ、重さ g と釣り合う終端速度 g/k（約 140px/秒）まで減速させる。紙はすぐに速く落ちない。
// - 揺れ: 落ちながら左右に揺れる。揺れの幅は頂点を過ぎてから広がる。
// - 裏返り: 紙は回りながら裏返るので、縦の倍率を cos で揺らし、明るさも裏表で変える。
// 位置は微分方程式 v' = g - k v の解を時刻で直接求め、フレームごとに積み上げない（途中の時刻でも同じ位置になる）。

enum ConfettiMode {
  /// 1 点から打ち上げる（正解の札）。
  burst,

  /// 画面の上から降らせる（結果の画面）。
  rain,
}

class _Piece {
  _Piece(math.Random r, ConfettiMode mode, Size size, Offset origin)
    : color = _colors[r.nextInt(_colors.length)],
      w = (mode == ConfettiMode.burst ? 9 : 7) + r.nextDouble() * 6,
      h = (mode == ConfettiMode.burst ? 5 : 4) + r.nextDouble() * 3,
      flip = 4 + r.nextDouble() * 8,
      flipPhase = r.nextDouble() * math.pi * 2,
      sway = 10 + r.nextDouble() * 22,
      swayRate = 2 + r.nextDouble() * 3,
      swayPhase = r.nextDouble() * math.pi * 2,
      spin = (r.nextDouble() - 0.5) * 6,
      angle0 = r.nextDouble() * math.pi * 2,
      delay = mode == ConfettiMode.burst ? r.nextDouble() * 0.06 : r.nextDouble() * 0.5 {
    if (mode == ConfettiMode.burst) {
      final a = -math.pi * (20 + r.nextDouble() * 140) / 180;
      final speed = 380 + r.nextDouble() * 620;
      p0 = origin;
      v0 = Offset(math.cos(a) * speed, math.sin(a) * speed);
    } else {
      p0 = Offset(r.nextDouble() * size.width, -20 - r.nextDouble() * 80);
      v0 = Offset((r.nextDouble() - 0.5) * 80, 40 + r.nextDouble() * 80);
    }
  }

  static const _colors = [DsColor.actionPrimary, DsColor.actionEmphasis, DsColor.rankHighlight, DsColor.statusSuccess, DsColor.contentPrimary];

  final Color color;
  final double w;
  final double h;
  final double flip;
  final double flipPhase;
  final double sway;
  final double swayRate;
  final double swayPhase;
  final double spin;
  final double angle0;

  /// 出始めの遅れ（秒）。
  final double delay;
  late final Offset p0;
  late final Offset v0;

  static const g = 560.0;
  static const k = 4.0;

  /// 時刻 t（秒）の位置。画面の座標で、下向きが正。v' = g - k v を解いた式。
  Offset at(double t) {
    final e = (1 - math.exp(-k * t)) / k;
    final x = p0.dx + v0.dx * e;
    final y = p0.dy + (v0.dy - g / k) * e + g / k * t;
    // 揺れは落ち始めてから広がる。
    final grow = (t / 0.6).clamp(0.0, 1.0);
    return Offset(x + math.sin(t * swayRate * math.pi + swayPhase) * sway * grow, y);
  }
}

/// 紙吹雪を描く。progress は 0〜1、duration はその長さ。
class ConfettiPainter extends CustomPainter {
  ConfettiPainter({required this.progress, required this.duration, required this.count, required this.mode, this.origin});

  final double progress;
  final Duration duration;
  final int count;
  final ConfettiMode mode;

  /// burst の打ち上げの点。null なら画面の中央の少し上。
  final Offset? origin;

  List<_Piece>? _pieces;
  Size? _size;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    if (_pieces == null || _size != size) {
      final r = math.Random(389);
      final o = origin ?? Offset(size.width / 2, size.height * 0.36);
      _pieces = [for (var i = 0; i < count; i++) _Piece(r, mode, size, o)];
      _size = size;
    }
    final seconds = progress * duration.inMilliseconds / 1000;
    // 終わりの 15% で消す。途中で消えると不自然なので、それまでは画面の外へ出るまで残す。
    final fade = progress < 0.85 ? 1.0 : 1 - (progress - 0.85) / 0.15;
    for (final p in _pieces!) {
      final t = seconds - p.delay;
      if (t <= 0) continue;
      final pos = p.at(t);
      if (pos.dy > size.height + 20) continue;
      final face = math.cos(t * p.flip + p.flipPhase);
      final paint = Paint()..color = Color.lerp(p.color, Colors.black, face < 0 ? 0.25 : 0)!.withValues(alpha: fade);
      canvas.save();
      canvas.translate(pos.dx, pos.dy);
      canvas.rotate(p.angle0 + p.spin * t);
      canvas.scale(1, face.abs() * 0.85 + 0.15);
      canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: p.w, height: p.h), paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(ConfettiPainter old) => old.progress != progress;
}
