import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

import 'format.dart';
import 'model.dart';
import 'theme.dart';
import 'pixel.dart';

// diamond の部品。baseball-journey-reel のリールで描いた UI を、操作できる部品に写す。
// 採用案が diamond だけになったので shared に置き、作成や詳細などの画面もこの造形で描く。
// 動きの値の根拠は README の「diamond の動きと値」の表にある。

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
    this.foreground,
    this.busy = false,
    this.expand = true,
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

  /// 字と印の色。省くと面の明るさから墨か紙を選ぶ。消す操作の赤字に使う。
  final Color? foreground;

  /// 処理中。二重に押せないようにし（disableWhileLoading）、面と文言を変えず回転する印だけを足す。
  final bool busy;

  /// 幅いっぱいに広げる。ダイアログの操作のように横に並べるときは false にする。
  final bool expand;

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
    final enabled = widget.onPressed != null && !widget.busy;
    final live = enabled || widget.busy;
    final fill = live ? (widget.fill ?? p.surface) : p.surfaceContainer;
    final fg = live ? (widget.foreground ?? inkOn(fill)) : p.onSurfaceVariant;
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
      mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.busy)
          SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2.5, color: fg))
        else if (widget.icon != null)
          Icon(widget.icon, size: 22, color: fg),
        if ((widget.busy || widget.icon != null) && widget.label.isNotEmpty) const SizedBox(width: Space.s150),
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
      onTap: enabled ? widget.onPressed : null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => _down() : null,
        onTapUp: enabled ? (_) => _up() : null,
        onTapCancel: enabled ? _up : null,
        onTap: enabled ? widget.onPressed : null,
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
                          : Border.all(color: live ? p.ink : p.outline, width: Bold.border),
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
    this.hideLabel = false,
    this.unit = '',
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

  /// 名前を画面に出さず、読み上げだけに使う。名前を行の左に別に置く一覧で使う。
  final bool hideLabel;

  /// 読み上げで数に添える単位（「 歳」「 年」）。
  final String unit;

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
    // 入団年のような 4 桁でも数が切れないよう、上限の桁数で幅を決める。
    final digits = math.max(widget.max.abs().toString().length, widget.min.abs().toString().length);
    final width = math.max(64.0, MediaQuery.textScalerOf(context).scale(textStyle.fontSize!) * 0.62 * digits + Space.s200);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.stacked && !widget.hideLabel) Text(widget.label, style: Txt.control),
        Row(
          children: [
            if (widget.hideLabel)
              const Spacer()
            else if (!widget.stacked)
              Expanded(child: Text(widget.label, style: Txt.control)),
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
              label: '${widget.label} ${widget.value}${widget.unit}',
              excludeSemantics: true,
              child: SizedBox(
                width: width,
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

/// 欄の入場。透明度と下からの 8px の浮き上がりで、index の順に 40ms ずつ遅らせて入れる（空間の連続）。
/// 時間は token の duration.press（160ms）と easing.out。遅れは 8 番目で止め、名鑑と同じ 320ms を上限にして待たせない。
/// たまに開く画面（履歴、設定、作成とシーズンの終了の段）に使い、1 季に 143 回開く選手トップには使わない。動きの抑制では動かさない。
class StaggerIn extends StatelessWidget {
  const StaggerIn({super.key, this.index = 0, this.from = const Offset(0, 8), required this.child});

  final int index;

  /// 入る前の位置。段を進めるときは進む向きから入れる。
  final Offset from;
  final Widget child;

  static const _step = Duration(milliseconds: 40);
  static const _maxIndex = 8;

  @override
  Widget build(BuildContext context) {
    if (Motion.reduced(context)) return child;
    return _Delayed(
      delay: _step * math.min(index, _maxIndex),
      builder: (started) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: started ? 1 : 0),
        duration: Motion.press,
        curve: Motion.out,
        builder: (context, t, child) => Opacity(
          opacity: t,
          child: Transform.translate(offset: from * (1 - t), child: child),
        ),
        child: child,
      ),
    );
  }
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

/// 今季の勝敗と順位。個人成績を主にするため、チームの成績はこの 1 行に留める。
class TeamRecord extends StatelessWidget {
  const TeamRecord({super.key, required this.season, this.showRank = true, this.rollLast = false});

  final Season season;

  /// 順位を右に出す。試合後は順位の増減が真下にあるので出さない。
  final bool showRank;

  /// 最後の試合で増えた勝敗の数を、1 つ前の数から桁送りで転がす（状態の明示）。試合後にだけ使う。
  /// 転がりは試合後の成績と同じ 700ms の Odometer で、動いている間も次の試合へ進める。
  final bool rollLast;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final countStyle = Txt.control.merge(Txt.tabular).copyWith(fontWeight: FontWeight.w700);
    // 勝敗を入れずに欠場で進めた試合は、勝敗の合計が試合数と合わない理由として数を添える。
    final unrecorded = season.stintGames.where((g) => g.outcome == null).length;
    return Semantics(
      label:
          'チーム ${season.wins} 勝 ${season.losses} 敗 ${season.draws} 分${unrecorded > 0 ? '、未記録 $unrecorded 試合' : ''}'
          '${showRank ? '、${season.teamRank} 位、${season.team.teamCount} 球団中' : ''}',
      excludeSemantics: true,
      child: Row(
        children: [
          for (final (count, unit, outcome) in [
            (season.wins, ' 勝 ', GameOutcome.win),
            (season.losses, ' 敗 ', GameOutcome.loss),
            (season.draws, ' 分', GameOutcome.draw),
          ]) ...[
            if (rollLast)
              Odometer(
                value: count,
                from: season.games.lastOrNull?.outcome == outcome ? count - 1 : count,
                digits: '$count'.length,
                style: countStyle.copyWith(color: p.onSurface),
                delay: const Duration(milliseconds: 150),
              )
            else
              Text('$count', style: countStyle),
            Text(unit, style: Txt.control.copyWith(fontWeight: FontWeight.w400)),
          ],
          if (unrecorded > 0)
            Text('  未記録 $unrecorded', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const Spacer(),
          if (showRank)
            Text.rich(TextSpan(children: [
            TextSpan(text: '${season.teamRank} 位', style: Txt.control.merge(Txt.tabular).copyWith(fontWeight: FontWeight.w700)),
            TextSpan(text: ' / ${season.team.teamCount} 球団', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          ])),
        ],
      ),
    );
  }
}

/// 1 試合の勝敗の見本。試合の一覧で勝敗を記号と一緒に示す。
class OutcomeSwatch extends StatelessWidget {
  const OutcomeSwatch(this.outcome, {super.key});

  final GameOutcome? outcome;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget box(Color? fill, {Color? border}) => Container(
      width: 14,
      height: 10,
      decoration: BoxDecoration(
        color: fill,
        border: border == null ? null : Border.all(color: border, width: 1.5),
      ),
    );
    return ExcludeSemantics(
      child: switch (outcome) {
        GameOutcome.win => box(p.primary, border: p.ink),
        GameOutcome.loss => box(p.onSurface),
        GameOutcome.draw => box(null, border: p.onSurface),
        null => const SizedBox(width: 14, height: 10),
      },
    );
  }
}

/// 選手の札。リールの CREATE で組み上げた札を、選手トップの顔にする。
/// reveal が 1 未満の間は、画素が降り、名前が入り、能力の棒が伸びる。
class PlayerCard extends StatelessWidget {
  const PlayerCard({super.key, required this.player, this.reveal = 1, this.showAbilities = true});

  final Player player;
  final double reveal;

  /// 能力の棒を札に並べる。選手トップでは今季の成績を先に見せるため出さず、能力は選手の詳細で見る。
  final bool showAbilities;

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
                  if (showAbilities) const SizedBox(height: Space.s300),
                  if (showAbilities)
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
