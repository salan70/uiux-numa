import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

import '../../shared/format.dart';
import '../../shared/model.dart';
import '../../shared/theme.dart';
import 'pixel.dart';

// diamond の部品。baseball-journey-reel のリールで描いた UI を、操作できる部品に写す。
// 動きの値の根拠は README の「diamond の動きと値」の表にある。

/// 太い輪郭とずらした影。製品の造形の幅（輪郭 2〜4px、影 4〜8px）の中で、リールに合わせて shared より 1 段強くする。
abstract final class Bold {
  static const border = 3.0;
  static const shadow = 5.0;
  static const radius = 12.0;
}

/// ばね。減衰比と 1 秒あたりの振動数で決める（質量 1）。
SpringDescription springOf(double zeta, double hz) =>
    SpringDescription.withDampingRatio(mass: 1, stiffness: math.pow(2 * math.pi * hz, 2).toDouble(), ratio: zeta);

/// 押し込みの戻り。行き過ぎを 1 回だけ見せる。
final pressSpring = springOf(0.5, 3.2);

/// 面の上の字の色。明るい面には墨、暗い面には紙を載せる。
Color inkOn(Color fill) => fill.computeLuminance() > 0.2 ? const Color(0xFF120D09) : const Color(0xFFFFFDF9);

/// 情報の面。太い輪郭と、押せない面なので控えめの影。
class BoldBox extends StatelessWidget {
  const BoldBox({super.key, required this.child, this.color, this.padding = EdgeInsets.zero, this.shadow = true});

  final Widget child;
  final Color? color;
  final EdgeInsetsGeometry padding;
  final bool shadow;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? p.surface,
        borderRadius: BorderRadius.circular(Bold.radius),
        border: Border.all(color: p.ink, width: Bold.border),
        boxShadow: shadow ? [BoxShadow(color: p.shadow, offset: const Offset(Bold.shadow, Bold.shadow))] : null,
      ),
      child: child,
    );
  }
}

/// 押せる面。押すと 80ms で影の分だけ沈み、離すとばねで戻る。速く叩いても沈み切ってから戻し、押した手応えを残す。
/// 動きの抑制では沈まず、影だけが消えて戻る。
class KeyButton extends StatefulWidget {
  const KeyButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.fill,
    this.icon,
    this.height = Sizes.target,
    this.semanticsLabel,
    this.semanticsHint,
    this.textStyle,
    this.dashed = false,
    this.oneLine = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final Color? fill;
  final IconData? icon;
  final double height;
  final String? semanticsLabel;
  final String? semanticsHint;
  final TextStyle? textStyle;

  /// 空の枠。まだ無いものを作る入口に使う。
  final bool dashed;

  /// 名前を折り返さず、幅に収まらなければ縮める。「ホームラ/ン」のように語の途中で割れると読めない短い名前に使う。
  final bool oneLine;

  @override
  State<KeyButton> createState() => _KeyButtonState();
}

class _KeyButtonState extends State<KeyButton> with SingleTickerProviderStateMixin {
  late final _depth = AnimationController.unbounded(vsync: this);

  @override
  void dispose() {
    _depth.dispose();
    super.dispose();
  }

  void _down() {
    if (Motion.reduced(context)) {
      _depth.value = 1;
      return;
    }
    _depth.animateTo(1, duration: const Duration(milliseconds: 80), curve: Curves.easeOutQuad);
  }

  Future<void> _up() async {
    if (Motion.reduced(context)) {
      _depth.value = 0;
      return;
    }
    if (_depth.value < 1) {
      try {
        await _depth.animateTo(1, duration: const Duration(milliseconds: 80), curve: Curves.easeOutQuad).orCancel;
      } on TickerCanceled {
        return;
      }
    }
    _depth.animateWith(SpringSimulation(pressSpring, _depth.value, 0, 0));
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final enabled = widget.onPressed != null;
    final fill = enabled ? (widget.fill ?? p.surface) : p.surfaceContainer;
    final fg = enabled ? inkOn(fill) : p.onSurfaceVariant;
    final reduced = Motion.reduced(context);
    final label = widget.dashed && widget.icon != null
        ? Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 32, color: p.onSurface),
              const SizedBox(height: Space.s100),
              Text(widget.label, textAlign: TextAlign.center, style: Txt.control.copyWith(color: p.onSurface)),
            ],
          )
        : Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.icon != null) Icon(widget.icon, size: 22, color: fg),
        if (widget.icon != null && widget.label.isNotEmpty) const SizedBox(width: Space.s150),
        if (widget.label.isNotEmpty)
          Flexible(
            child: widget.oneLine
                ? FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      widget.label,
                      maxLines: 1,
                      softWrap: false,
                      style: (widget.textStyle ?? Txt.control).copyWith(color: fg),
                    ),
                  )
                : Text(
                    widget.label,
                    textAlign: TextAlign.center,
                    style: (widget.textStyle ?? Txt.control).copyWith(color: fg),
                  ),
          ),
      ],
    );
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.semanticsLabel ?? widget.label,
      hint: widget.semanticsHint,
      excludeSemantics: true,
      onTap: widget.onPressed,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => _down() : null,
        onTapUp: enabled ? (_) => _up() : null,
        onTapCancel: enabled ? _up : null,
        onTap: widget.onPressed,
        child: Padding(
          padding: const EdgeInsets.only(right: Bold.shadow, bottom: Bold.shadow),
          child: AnimatedBuilder(
            animation: _depth,
            builder: (context, child) {
              final d = enabled ? _depth.value.clamp(-0.3, 1.0) : 1.0;
              final shift = reduced ? 0.0 : Bold.shadow * d.clamp(0.0, 1.0);
              final shadow = Bold.shadow * (1 - d);
              return Transform.translate(
                offset: Offset(shift, shift),
                child: CustomPaint(
                  painter: widget.dashed ? _DashPainter(p.ink) : null,
                  child: Container(
                    constraints: BoxConstraints(minHeight: widget.height),
                    padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s150),
                    decoration: BoxDecoration(
                      color: widget.dashed ? Colors.transparent : fill,
                      borderRadius: BorderRadius.circular(Bold.radius),
                      border: widget.dashed
                          ? null
                          : Border.all(color: enabled ? p.ink : p.outline, width: Bold.border),
                      boxShadow: widget.dashed || shadow <= 0
                          ? null
                          : [BoxShadow(color: p.shadow, offset: Offset(shadow, shadow))],
                    ),
                    // 高さは中身と minHeight で決め、下端の帯のような緩い制約でも縦に伸ばさない。
                    child: Center(heightFactor: 1, child: child),
                  ),
                ),
              );
            },
            child: label,
          ),
        ),
      ),
    );
  }
}

class _DashPainter extends CustomPainter {
  _DashPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = Bold.border;
    final path = Path()
      ..addRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(Bold.radius)).deflate(1.5));
    for (final metric in path.computeMetrics()) {
      for (var d = 0.0; d < metric.length; d += 16) {
        canvas.drawPath(metric.extractPath(d, math.min(d + 9, metric.length)), paint);
      }
    }
  }

  @override
  bool shouldRepaint(_DashPainter old) => old.color != color;
}

/// − 数 + の増減。上限と下限でも押せ、押すと次の数が 30% だけ見えてばねで戻る。
/// 拒否の文字より先に手応えで伝え、理由の行は常に確保して下の要素を動かさない（States & Feedback）。
class RubberStepper extends StatefulWidget {
  const RubberStepper({
    super.key,
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    this.limitNote,
    this.floorNote,
    this.stacked = false,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;
  final String? limitNote;
  final String? floorNote;

  /// 名前を上に置き、− 数 + を左に寄せる。2 つを横に並べて入力面の上の高さを空けるときに使う。
  final bool stacked;

  @override
  State<RubberStepper> createState() => _RubberStepperState();
}

class _RubberStepperState extends State<RubberStepper> with TickerProviderStateMixin {
  late final _roll = AnimationController(vsync: this, duration: const Duration(milliseconds: 140), value: 1);
  late final _push = AnimationController.unbounded(vsync: this);
  int _from = 0;
  int _pushSign = 1;
  bool _hit = false;

  @override
  void didUpdateWidget(RubberStepper old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value) {
      _from = old.value;
      _hit = false;
      if (Motion.reduced(context)) {
        _roll.value = 1;
      } else {
        _roll.forward(from: 0);
      }
    }
  }

  @override
  void dispose() {
    _roll.dispose();
    _push.dispose();
    super.dispose();
  }

  Future<void> _bounce(int sign) async {
    setState(() {
      _pushSign = sign;
      _hit = true;
    });
    if (Motion.reduced(context)) return;
    try {
      await _push.animateTo(0.3, duration: const Duration(milliseconds: 70), curve: Curves.easeOutQuad).orCancel;
    } on TickerCanceled {
      return;
    }
    _push.animateWith(SpringSimulation(springOf(0.35, 3.5), _push.value, 0, 0));
  }

  void _step(int delta) {
    final next = widget.value + delta;
    if (next > widget.max || next < widget.min) {
      _bounce(delta);
      return;
    }
    widget.onChanged(next);
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final atMax = widget.value >= widget.max;
    final atMin = widget.value <= widget.min && widget.min > 0;
    final note = atMax ? widget.limitNote : (atMin ? widget.floorNote : null);
    final textStyle = Txt.figure.copyWith(color: p.onSurface);
    final height = MediaQuery.textScalerOf(context).scale(textStyle.fontSize!) * 1.3;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.stacked) Text(widget.label, style: Txt.control),
        Row(
          children: [
            if (!widget.stacked) Expanded(child: Text(widget.label, style: Txt.control)),
            SizedBox(
              width: Sizes.target + Bold.shadow,
              child: KeyButton(
                label: '',
                icon: Icons.remove,
                semanticsLabel: '${widget.label}を 1 減らす',
                semanticsHint: atMin || widget.value <= widget.min ? '下限です' : null,
                onPressed: () => _step(-1),
              ),
            ),
            Semantics(
              liveRegion: true,
              label: '${widget.label} ${widget.value}',
              excludeSemantics: true,
              child: SizedBox(
                width: 64,
                height: height,
                child: ClipRect(
                  child: AnimatedBuilder(
                    animation: Listenable.merge([_roll, _push]),
                    builder: (context, _) {
                      final r = Curves.easeOutCubic.transform(_roll.value);
                      final up = widget.value >= _from;
                      final push = _push.value * _pushSign;
                      Widget digit(String s, double dy, Color color) => Transform.translate(
                        offset: Offset(0, dy),
                        child: Center(child: Text(s, style: textStyle.copyWith(color: color))),
                      );
                      return Stack(
                        fit: StackFit.expand,
                        children: [
                          if (r < 1) ...[
                            digit('$_from', (up ? -1 : 1) * r * height, p.onSurface),
                            digit('${widget.value}', (up ? 1 : -1) * (1 - r) * height, p.onSurface),
                          ] else ...[
                            digit('${widget.value}', -push * height, p.onSurface),
                            if (push != 0)
                              digit('${widget.value + _pushSign}', (_pushSign - push) * height, p.tertiary),
                          ],
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
            SizedBox(
              width: Sizes.target + Bold.shadow,
              child: KeyButton(
                label: '',
                icon: Icons.add,
                semanticsLabel: '${widget.label}を 1 増やす',
                semanticsHint: atMax ? '上限です' : null,
                onPressed: () => _step(1),
              ),
            ),
          ],
        ),
        if (widget.limitNote != null || widget.floorNote != null)
          Semantics(
            liveRegion: _hit,
            child: Text(
              note ?? '',
              textAlign: widget.stacked ? TextAlign.left : TextAlign.right,
              style: Txt.caption.copyWith(
                color: _hit ? p.error : p.onSurfaceVariant,
                fontWeight: _hit ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ),
      ],
    );
  }
}

/// 数を桁ごとに転がす。下の桁が 9 から 0 へ回るときだけ上の桁も回る、機械の桁送りにする。
/// from から value へ 700ms で転がり、動きの抑制では転がさない。
class Odometer extends StatelessWidget {
  const Odometer({
    super.key,
    required this.value,
    this.from,
    required this.digits,
    required this.style,
    this.prefix = '',
    this.delay = Duration.zero,
  });

  final int value;
  final int? from;
  final int digits;
  final TextStyle style;
  final String prefix;
  final Duration delay;

  @override
  Widget build(BuildContext context) {
    final reduced = Motion.reduced(context);
    final start = from ?? value;
    return Semantics(
      label: '$prefix${value.toString().padLeft(digits, '0')}',
      excludeSemantics: true,
      child: _Delayed(
        delay: reduced ? Duration.zero : delay,
        builder: (started) => TweenAnimationBuilder<double>(
          tween: Tween(begin: start.toDouble(), end: (started ? value : start).toDouble()),
          duration: reduced ? Duration.zero : const Duration(milliseconds: 700),
          curve: Curves.easeOutCubic,
          builder: (context, v, _) => _digits(context, v),
        ),
      ),
    );
  }

  Widget _digits(BuildContext context, double v) {
    final scaler = MediaQuery.textScalerOf(context);
    final painter = TextPainter(
      text: TextSpan(text: '0', style: style),
      textDirection: TextDirection.ltr,
      textScaler: scaler,
    )..layout();
    final w = painter.width;
    final h = painter.height;
    final cols = <Widget>[];
    for (var k = digits - 1; k >= 0; k--) {
      final place = math.pow(10, k).toInt();
      final d = (v / place).floor() % 10;
      final frac = k == 0 ? v - v.floor() : math.max(0.0, (v % place) - (place - 1));
      cols.add(
        SizedBox(
          width: w,
          height: h,
          child: ClipRect(
            child: Stack(
              children: [
                Transform.translate(offset: Offset(0, -frac * h), child: Text('$d', style: style)),
                if (frac > 0)
                  Transform.translate(offset: Offset(0, (1 - frac) * h), child: Text('${(d + 1) % 10}', style: style)),
              ],
            ),
          ),
        ),
      );
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [if (prefix.isNotEmpty) Text(prefix, style: style), ...cols],
    );
  }
}

/// 遅らせてから builder に true を渡す。
class _Delayed extends StatefulWidget {
  const _Delayed({required this.delay, required this.builder});

  final Duration delay;
  final Widget Function(bool started) builder;

  @override
  State<_Delayed> createState() => _DelayedState();
}

class _DelayedState extends State<_Delayed> {
  late bool _started = widget.delay == Duration.zero;

  @override
  void initState() {
    super.initState();
    if (!_started) {
      Future.delayed(widget.delay, () {
        if (mounted) setState(() => _started = true);
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.builder(_started);
}

/// 直前との差の札。遅れてばねで跳ね、行き過ぎを 1 回だけ見せる。
class DeltaChip extends StatefulWidget {
  const DeltaChip({super.key, required this.text, this.delay = Duration.zero, this.up = true});

  final String text;
  final Duration delay;
  final bool up;

  @override
  State<DeltaChip> createState() => _DeltaChipState();
}

class _DeltaChipState extends State<DeltaChip> with SingleTickerProviderStateMixin {
  late final _c = AnimationController.unbounded(vsync: this);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (Motion.reduced(context)) {
        _c.value = 1;
        return;
      }
      Future.delayed(widget.delay, () {
        if (mounted) _c.animateWith(SpringSimulation(springOf(0.42, 3.4), 0, 1, 0));
      });
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final fill = widget.up ? p.tertiaryContainer : p.surfaceContainer;
    return AnimatedBuilder(
      animation: _c,
      builder: (context, child) => Transform.rotate(
        angle: -0.06 * _c.value,
        child: Transform.scale(scale: _c.value.clamp(0.0, 2.0), child: child),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: Space.s200, vertical: Space.s50),
        decoration: BoxDecoration(
          color: fill,
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: p.ink, width: Borders.thick),
        ),
        child: Text(widget.text, style: Txt.control.merge(Txt.tabular).copyWith(color: inkOn(fill))),
      ),
    );
  }
}

/// ドットの紙吹雪。記録達成のように稀なときだけ使う。粒の動きは添字から決め、毎回同じ絵にする。
class PixelBurst extends StatefulWidget {
  const PixelBurst({super.key, this.delay = Duration.zero});

  final Duration delay;

  @override
  State<PixelBurst> createState() => _PixelBurstState();
}

class _PixelBurstState extends State<PixelBurst> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100));

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || Motion.reduced(context)) return;
      Future.delayed(widget.delay, () {
        if (mounted) _c.forward();
      });
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _c,
        builder: (context, _) => CustomPaint(
          painter: _BurstPainter(_c.value, [p.primary, p.secondary, p.tertiary, p.ink]),
          size: Size.infinite,
        ),
      ),
    );
  }
}

class _BurstPainter extends CustomPainter {
  _BurstPainter(this.t, this.colors);

  final double t;
  final List<Color> colors;

  double _h(int n) {
    final x = math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - x.floorToDouble();
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (t <= 0 || t >= 1) return;
    final e = t * 1.1;
    final fade = 1 - t;
    final origin = Offset(size.width / 2, size.height * 0.35);
    final paint = Paint()..isAntiAlias = false;
    for (var i = 0; i < 40; i++) {
      final a = _h(i * 3) * math.pi * 2;
      final v = 520 * (0.45 + _h(i * 7) * 0.75);
      final d = v * (1 - math.exp(-3 * e)) / 3;
      final pos = origin + Offset(math.cos(a) * d, math.sin(a) * d + 0.5 * 1400 * e * e);
      final s = 8 * (0.6 + _h(i + 1) * 0.7) * (0.4 + 0.6 * fade);
      paint.color = colors[i % colors.length].withValues(alpha: fade);
      canvas.save();
      canvas.translate(pos.dx, pos.dy);
      canvas.rotate(e * (_h(i + 5) - 0.5) * 14);
      canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: s, height: s), paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_BurstPainter old) => old.t != t;
}

/// 白球の印。打率の小数点と題字に使う。
class BallMark extends StatelessWidget {
  const BallMark({super.key, this.size = 24, this.spin = 0});

  final double size;
  final double spin;

  @override
  Widget build(BuildContext context) =>
      ExcludeSemantics(child: CustomPaint(size: Size.square(size), painter: _BallPainter(spin)));
}

class _BallPainter extends CustomPainter {
  _BallPainter(this.spin);

  final double spin;

  @override
  void paint(Canvas canvas, Size size) {
    final r = size.width / 2;
    final c = Offset(r, r);
    canvas.drawCircle(c, r, Paint()..color = const Color(0xFFFFFDF9));
    canvas.save();
    canvas.clipPath(Path()..addOval(Rect.fromCircle(center: c, radius: r)));
    canvas.translate(r, r);
    canvas.rotate(spin);
    final seam = Paint()
      ..color = const Color(0xFFD8412A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = math.max(1.2, r * 0.12);
    for (final s in [-1.0, 1.0]) {
      canvas.drawCircle(Offset(s * r * 1.55, 0), r * 1.08, seam);
    }
    canvas.restore();
    canvas.drawCircle(
      c,
      r - math.max(1, r * 0.08) / 2,
      Paint()
        ..color = const Color(0xFF120D09)
        ..style = PaintingStyle.stroke
        ..strokeWidth = math.max(1, r * 0.08),
    );
  }

  @override
  bool shouldRepaint(_BallPainter old) => old.spin != spin;
}

/// 夜の球場の地。斜めに刈った芝の帯。
class NightFieldPainter extends CustomPainter {
  const NightFieldPainter();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = Night.field);
    final stripe = Paint()..color = Night.stripe;
    final slant = size.height * 0.45;
    for (var x = -slant; x < size.width + 90; x += 120) {
      canvas.drawPath(
        Path()
          ..moveTo(x, 0)
          ..lineTo(x + 60, 0)
          ..lineTo(x + 60 + slant, size.height)
          ..lineTo(x + slant, size.height)
          ..close(),
        stripe,
      );
    }
  }

  @override
  bool shouldRepaint(NightFieldPainter old) => false;
}

/// 今季の 143 試合の升。勝ちを黄、負けを墨、引き分けを枠、欠場を網で並べる。
/// 次の試合の升は太い枠で示し、試合後は増えた升が一度大きくなって収まる。
class SeasonGrid extends StatelessWidget {
  const SeasonGrid({super.key, required this.season, this.popLast = false});

  final Season season;
  final bool popLast;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final games = season.games;
    final wins = games.where((g) => g.outcome == GameOutcome.win).length;
    final losses = games.where((g) => g.outcome == GameOutcome.loss).length;
    final draws = games.where((g) => g.outcome == GameOutcome.draw).length;
    final skipped = games.where((g) => !g.played).length;
    final label =
        '${season.totalGames} 試合のうち ${season.playedCount} 試合を終えました。$wins 勝 $losses 敗 $draws 分、欠場 $skipped';
    final reduced = Motion.reduced(context);
    return Semantics(
      label: label,
      excludeSemantics: true,
      child: LayoutBuilder(
        builder: (context, c) {
          final pitch = c.maxWidth / 13;
          return TweenAnimationBuilder<double>(
            tween: Tween(begin: popLast && !reduced ? 0 : 1, end: 1),
            duration: const Duration(milliseconds: 420),
            builder: (context, t, _) => CustomPaint(
              size: Size(c.maxWidth, pitch * 0.42 * 11),
              painter: _GridPainter(season, p, popLast ? t : 1),
            ),
          );
        },
      ),
    );
  }
}

/// 欠場の升。塗りでなく網にして、引き分けやこれからの升と形で分ける。
void paintSkippedCell(Canvas canvas, Rect rect, Color color) {
  final stroke = Paint()
    ..color = color
    ..style = PaintingStyle.stroke
    ..strokeWidth = 1.5;
  canvas.drawRect(rect.deflate(0.75), stroke);
  canvas.save();
  canvas.clipRect(rect);
  stroke.strokeWidth = 1.2;
  final span = rect.width + rect.height;
  for (var x = rect.left - rect.height; x < rect.right; x += 4) {
    canvas.drawLine(Offset(x, rect.bottom), Offset(x + span, rect.bottom - span), stroke);
  }
  canvas.restore();
}

class _GridPainter extends CustomPainter {
  _GridPainter(this.season, this.p, this.pop);

  final Season season;
  final Palette p;
  final double pop;

  @override
  void paint(Canvas canvas, Size size) {
    final pw = size.width / 13;
    final ph = size.height / 11;
    final w = pw - 4;
    final h = ph - 4;
    final games = season.games;
    final fill = Paint();
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    for (var i = 0; i < season.totalGames; i++) {
      final col = i % 13;
      final row = i ~/ 13;
      var rect = Rect.fromLTWH(col * pw + 2, row * ph + 2, w, h);
      if (i < games.length) {
        final g = games[i];
        if (i == games.length - 1 && pop < 1) {
          // 増えた升。1.8 倍から 420ms で収まる。
          final s = 1 + 0.8 * (1 - Curves.easeOutBack.transform(pop));
          rect = Rect.fromCenter(center: rect.center, width: w * s, height: h * s);
        }
        switch (g.outcome) {
          case GameOutcome.win:
            fill.color = p.primary;
            canvas.drawRect(rect, fill);
            stroke.color = p.ink;
            canvas.drawRect(rect.deflate(0.75), stroke);
          case GameOutcome.loss:
            fill.color = p.onSurface;
            canvas.drawRect(rect, fill);
          case GameOutcome.draw:
            stroke.color = p.onSurface;
            canvas.drawRect(rect.deflate(0.75), stroke);
          case null:
            paintSkippedCell(canvas, rect, p.onSurfaceVariant);
        }
      } else if (i == games.length) {
        stroke
          ..color = p.onSurface
          ..strokeWidth = 3;
        canvas.drawRect(rect.deflate(1.5), stroke);
        stroke.strokeWidth = 1.5;
      } else {
        stroke.color = p.outline.withValues(alpha: 0.45);
        canvas.drawRect(rect.deflate(0.75), stroke);
      }
    }
  }

  @override
  bool shouldRepaint(_GridPainter old) => true;
}

/// 升の凡例。色だけで区別せず、数を添えて今季の勝敗の記録としても読めるようにする。
class SeasonGridLegend extends StatelessWidget {
  const SeasonGridLegend({super.key, required this.season});

  final Season season;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final games = season.games;
    final wins = games.where((g) => g.outcome == GameOutcome.win).length;
    final losses = games.where((g) => g.outcome == GameOutcome.loss).length;
    final draws = games.where((g) => g.outcome == GameOutcome.draw).length;
    final skipped = games.where((g) => !g.played).length;
    Widget item(Widget swatch, String label, [int? count]) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        swatch,
        const SizedBox(width: Space.s100),
        Text.rich(TextSpan(children: [
          TextSpan(text: label, style: Txt.caption),
          if (count != null) ...[
            const TextSpan(text: ' '),
            TextSpan(text: '$count', style: Txt.caption.merge(Txt.tabular).copyWith(fontWeight: FontWeight.w700)),
          ],
        ])),
      ],
    );
    Widget box(Color? fill, {Color? border, double width = 1.5}) => Container(
      width: 14,
      height: 10,
      decoration: BoxDecoration(
        color: fill,
        border: border == null ? null : Border.all(color: border, width: width),
      ),
    );
    return ExcludeSemantics(
      child: Wrap(
        spacing: Space.s300,
        runSpacing: Space.s100,
        children: [
          item(box(p.primary, border: p.ink), '勝ち', wins),
          item(box(p.onSurface), '負け', losses),
          item(box(null, border: p.onSurface), '引き分け', draws),
          item(CustomPaint(size: const Size(14, 10), painter: _SkippedSwatchPainter(p.onSurfaceVariant)), '欠場', skipped),
          if (!season.isComplete) item(box(null, border: p.onSurface, width: 3), '次の試合'),
        ],
      ),
    );
  }
}

class _SkippedSwatchPainter extends CustomPainter {
  const _SkippedSwatchPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) => paintSkippedCell(canvas, Offset.zero & size, color);

  @override
  bool shouldRepaint(_SkippedSwatchPainter old) => old.color != color;
}

/// 選手の札。リールの CREATE で組み上げた札を、選手トップの顔にする。
/// reveal が 1 未満の間は、画素が降り、名前が入り、能力の棒が伸びる。
class PlayerCard extends StatelessWidget {
  const PlayerCard({super.key, required this.player, this.reveal = 1});

  final Player player;
  final double reveal;

  static const _barColors = [Color(0xFFF37252), Color(0xFF4078E0), Color(0xFFFAC400)];

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    final band = player.isActive ? teamColor(s.team) : p.outline;
    final bandInk = inkOn(band);
    double phase(double a, double b) => ((reveal - a) / (b - a)).clamp(0.0, 1.0);
    final nameIn = Curves.easeOut.transform(phase(0.35, 0.6));
    return BoldBox(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(Bold.radius - Bold.border),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: band,
              padding: const EdgeInsets.symmetric(horizontal: Space.s400, vertical: Space.s200),
              child: Row(
                children: [
                  Expanded(
                    child: Text(s.team.name, style: Txt.heading.copyWith(color: bandInk)),
                  ),
                  Semantics(
                    label: '背番号 ${s.uniformNumber}',
                    excludeSemantics: true,
                    child: Text('#${s.uniformNumber}', style: Txt.figureSm.copyWith(color: bandInk)),
                  ),
                ],
              ),
            ),
            Container(height: Bold.border, color: p.ink),
            Padding(
              padding: const EdgeInsets.all(Space.s400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: p.secondaryContainer,
                          borderRadius: BorderRadius.circular(Radii.control),
                          border: Border.all(color: p.ink, width: Borders.thick),
                        ),
                        padding: const EdgeInsets.all(Space.s150),
                        child: PixelAvatar(player: player, size: 96, reveal: phase(0, 0.5)),
                      ),
                      const SizedBox(width: Space.s300),
                      Expanded(
                        child: Wrap(
                          spacing: Space.s150,
                          runSpacing: Space.s150,
                          children: [
                            _Tag(player.mainPosition.label, p.tertiary, show: phase(0.3, 0.5)),
                            _Tag(player.handedness, p.surface, show: phase(0.35, 0.55)),
                            _Tag('${player.age} 歳', p.primary, show: phase(0.4, 0.6)),
                            _Tag('プロ ${player.proYears} 年目', p.surface, show: phase(0.45, 0.65)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: Space.s300),
                  Opacity(
                    opacity: nameIn,
                    child: Transform.translate(
                      offset: Offset(0, 12 * (1 - nameIn)),
                      child: Semantics(
                        header: true,
                        child: Text(player.name, style: Txt.title.copyWith(fontSize: 32, height: 1.2)),
                      ),
                    ),
                  ),
                  const SizedBox(height: Space.s300),
                  for (var i = 0; i < s.abilities.length; i++)
                    _AbilityRow(
                      ability: s.abilities[i],
                      color: _barColors[i % _barColors.length],
                      grow: Curves.easeOutExpo.transform(phase(0.5 + i * 0.04, 0.85 + i * 0.04)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag(this.text, this.fill, {this.show = 1});

  final String text;
  final Color fill;
  final double show;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = Curves.easeOutBack.transform(show);
    return Transform.scale(
      scale: s,
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: Space.s200, vertical: Space.s50),
        decoration: BoxDecoration(
          color: fill,
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: p.ink, width: Borders.thick),
          boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(2, 2))],
        ),
        child: Text(text, style: Txt.control.copyWith(color: inkOn(fill))),
      ),
    );
  }
}

class _AbilityRow extends StatelessWidget {
  const _AbilityRow({required this.ability, required this.color, required this.grow});

  final Ability ability;
  final Color color;
  final double grow;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final shown = (1 + (ability.value - 1) * grow).round();
    final rank = abilityRank(ability.value);
    final badge = switch (rank) {
      'S+' || 'S' => p.primary,
      'A' => p.tertiary,
      'B' => p.secondary,
      _ => p.surface,
    };
    return Semantics(
      label: '${ability.name} ${ability.rank} ${ability.value}',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.only(bottom: Space.s200),
        child: LayoutBuilder(
          builder: (context, c) {
            final name = Text(ability.name, style: Txt.control);
            final bar = Container(
              height: 18,
              decoration: BoxDecoration(
                color: p.surface,
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: p.ink, width: Borders.thick),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: (ability.value / 99 * grow).clamp(0.0, 1.0),
                child: Container(color: color),
              ),
            );
            final value = Text('$shown', textAlign: TextAlign.right, style: Txt.control.merge(Txt.tabular));
            final rankBadge = Opacity(
              opacity: grow >= 0.98 ? 1 : 0,
              child: Container(
                constraints: const BoxConstraints(minWidth: 30),
                padding: const EdgeInsets.symmetric(horizontal: Space.s100),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: badge,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: p.ink, width: Borders.thick),
                ),
                child: Text(rank, style: Txt.control.copyWith(color: inkOn(badge))),
              ),
            );
            // 文字を拡大して 1 行に収まらないときは、名前と数を上の行に、棒を下の行に分ける。名前と数を折り返さない。
            final scale = MediaQuery.textScalerOf(context).scale(1);
            if (c.maxWidth / scale < 280) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(child: name),
                      value,
                      const SizedBox(width: Space.s150),
                      rankBadge,
                    ],
                  ),
                  const SizedBox(height: Space.s100),
                  bar,
                ],
              );
            }
            return Row(
              children: [
                SizedBox(width: 84, child: name),
                Expanded(child: bar),
                SizedBox(width: 40, child: value),
                const SizedBox(width: Space.s150),
                rankBadge,
              ],
            );
          },
        ),
      ),
    );
  }
}

/// 打率の見出し。小数点を白球にし、数が転がる間だけ球が回る。
class AverageFigure extends StatelessWidget {
  const AverageFigure({super.key, required this.value, this.from, this.style});

  final double? value;
  final double? from;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final st = style ?? Txt.figure.copyWith(fontSize: 64, height: 1.1);
    if (value == null) return Text('---', style: st);
    final now = (value! * 1000).round();
    final was = from == null ? null : (from! * 1000).round();
    final ball = MediaQuery.textScalerOf(context).scale(st.fontSize!) * 0.34;
    return Semantics(
      label: '打率 ${rate(value)}',
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Padding(
            padding: EdgeInsets.only(bottom: ball * 0.5, right: ball * 0.2),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: was == null || Motion.reduced(context) ? 0 : 1),
              duration: const Duration(milliseconds: 700),
              curve: Curves.easeOutCubic,
              builder: (context, t, _) => BallMark(size: ball, spin: t * 12),
            ),
          ),
          Odometer(value: now, from: was, digits: 3, style: st),
        ],
      ),
    );
  }
}
