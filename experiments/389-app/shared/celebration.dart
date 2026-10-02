import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'confetti.dart';
import 'data.dart';
import 'ds.dart';

// 正解の演出。1 問に 1 回の稀な場面なので、目的を「喜び」に置き、画面全体を使って大きく動かす。
// 押せばすぐ結果へ移れるので、長さ（約 1.7 秒）が遊びを止めることはない。
//
// 時間割（ms）:
//   0–160    画面全体がランクの色で光る（不透明度 0.45 から 0 へ）
//   0–240    「正解！」の札が 2.4 倍から叩きつけられる（easeIn）。着地で影が 0 から 8px へ伸びる
//   240–520  着地の衝撃で画面が揺れる（振幅 10px、減衰）
//   240–1700 札の背後で、ランクの色の放射の光が広がりながらゆっくり回る
//   240–1700 札の中心から紙吹雪が上向きに打ち上がり、ゆっくり舞い落ちる（confetti.dart）。量はランクで変える（SS 140、S 110、A 80、B 60、C 40）
//   240–     表の開いていないマスが斜めの波で開く（StatsTable の cascade）
// 動きを止める設定では、光、揺れ、放射、紙吹雪を出さず、札だけを置く。

/// 正解の演出の長さ。この後に結果へ移る。
const celebrationLength = Duration(milliseconds: 1700);

/// 紙吹雪の量。少ない手がかりで当てたほど多い。
int _burstCount(Rank r) => switch (r) {
  Rank.ss => 140,
  Rank.s => 110,
  Rank.a => 80,
  Rank.b => 60,
  _ => 40,
};

/// child（クイズの画面）を揺らし、その上に光、放射、紙吹雪、札を重ねる。active が false の間は child をそのまま描く。
class Celebration extends StatefulWidget {
  const Celebration({required this.active, required this.rank, required this.name, required this.child, super.key});

  final bool active;
  final Rank rank;
  final String name;
  final Widget child;

  @override
  State<Celebration> createState() => _CelebrationState();
}

class _CelebrationState extends State<Celebration> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: celebrationLength);
  bool _still = false;

  @override
  void didUpdateWidget(Celebration old) {
    super.didUpdateWidget(old);
    if (!old.active && widget.active) {
      _still = dsStill(context);
      if (_still) {
        _t.value = 0.5;
      } else {
        _t.forward(from: 0);
        // 札の着地に合わせて端末を震わせる。Web では何もしない。
        Future<void>.delayed(const Duration(milliseconds: 240), HapticFeedback.heavyImpact);
      }
    }
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  /// 0〜1 の時間を、ミリ秒の区間 [a, b] の進みに直す。
  double _seg(double a, double b) => ((_t.value * celebrationLength.inMilliseconds - a) / (b - a)).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    final color = dsRankColor(widget.rank.label);
    // 演出の有無で木の形を変えない。変えると child（表のマス）が作り直され、残りのマスが波を待たずに一度に開くため。
    return AnimatedBuilder(
      animation: _t,
      child: widget.child,
      builder: (context, child) {
        if (!widget.active) {
          return Stack(
            children: [Transform.translate(offset: Offset.zero, child: child)],
          );
        }
        final shake = _still ? 0.0 : _seg(240, 520);
        final dx = shake == 0 || shake == 1 ? 0.0 : math.sin(shake * math.pi * 7) * 10 * (1 - shake);
        final dy = shake == 0 || shake == 1 ? 0.0 : math.cos(shake * math.pi * 5) * 4 * (1 - shake);
        final flash = _still ? 0.0 : 0.45 * (1 - _seg(0, 160));
        return Stack(
          children: [
            Transform.translate(offset: Offset(dx, dy), child: child),
            if (!_still) ...[
              Positioned.fill(
                child: IgnorePointer(
                  child: ColoredBox(color: color.withValues(alpha: flash)),
                ),
              ),
              Positioned.fill(
                child: IgnorePointer(
                  child: CustomPaint(
                    painter: _RaysPainter(progress: _seg(240, 1700), color: color),
                  ),
                ),
              ),
              Positioned.fill(
                child: IgnorePointer(
                  child: CustomPaint(
                    painter: ConfettiPainter(progress: _seg(240, 1700), duration: const Duration(milliseconds: 1460), count: _burstCount(widget.rank), mode: ConfettiMode.burst),
                  ),
                ),
              ),
            ],
            Positioned.fill(
              child: IgnorePointer(
                child: Align(
                  alignment: const Alignment(0, -0.28),
                  child: _Stamp(slam: _still ? 1 : _seg(0, 240), name: widget.name, rank: widget.rank),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// 「正解！」の札。緑の面に、正解の文字、選手名、ランクを載せる。
class _Stamp extends StatelessWidget {
  const _Stamp({required this.slam, required this.name, required this.rank});

  /// 0〜1。叩きつけの進み。
  final double slam;
  final String name;
  final Rank rank;

  @override
  Widget build(BuildContext context) {
    final v = Curves.easeIn.transform(slam);
    return Semantics(
      liveRegion: true,
      label: '正解。$name。ランク ${rank.label}',
      excludeSemantics: true,
      child: Opacity(
        opacity: (slam * 3).clamp(0, 1),
        child: Transform.scale(
          scale: 2.4 - 1.4 * v,
          child: Transform.rotate(
            angle: -0.06 * (1 - v) - 0.03,
            child: Container(
              padding: const EdgeInsets.fromLTRB(32, 16, 32, 18),
              decoration: BoxDecoration(
                color: DsColor.statusSuccess,
                borderRadius: DsRadius.borderMd,
                border: Border.all(color: DsColor.onAction, width: DsBorder.strong),
                boxShadow: [BoxShadow(color: DsColor.shadow, offset: Offset(0, 8 * v))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('正解！', style: DsTypography.headline1.copyWith(color: DsColor.onAction, fontSize: 52, height: 1.05)),
                  const SizedBox(height: 4),
                  Text(
                    name,
                    style: DsTypography.body1.copyWith(color: DsColor.onAction, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                    decoration: BoxDecoration(color: DsColor.onAction, borderRadius: DsRadius.borderXs),
                    child: Text('ランク ${rank.label}', style: DsTypography.displayNumeric.copyWith(fontSize: 18, color: dsRankColor(rank.label))),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 札の背後の放射の光。v2 の装飾に合わせ、ぼかさない単色の扇を交互に置く。
class _RaysPainter extends CustomPainter {
  const _RaysPainter({required this.progress, required this.color});

  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final c = Offset(size.width / 2, size.height * 0.36);
    final grow = Curves.easeOutCubic.transform((progress / 0.25).clamp(0, 1));
    final fade = progress < 0.75 ? 1.0 : 1 - (progress - 0.75) / 0.25;
    final r = size.longestSide * (0.3 + 0.7 * grow);
    // ランクの色と黄を交互に置き、扇は細くして、濁った面でなく光の筋に見せる。
    final paints = [Paint()..color = color.withValues(alpha: 0.32 * fade), Paint()..color = DsColor.rankHighlight.withValues(alpha: 0.22 * fade)];
    const n = 24;
    final spin = progress * 0.9;
    for (var i = 0; i < n; i++) {
      final paint = paints[i % 2];
      final a = spin + i * 2 * math.pi / n;
      final w = math.pi / n * 0.32;
      canvas.drawPath(
        Path()
          ..moveTo(c.dx, c.dy)
          ..lineTo(c.dx + math.cos(a - w) * r, c.dy + math.sin(a - w) * r)
          ..lineTo(c.dx + math.cos(a + w) * r, c.dy + math.sin(a + w) * r)
          ..close(),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_RaysPainter old) => old.progress != progress || old.color != color;
}
