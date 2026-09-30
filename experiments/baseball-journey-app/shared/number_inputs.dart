import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'format.dart';
import 'parts.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 数の入力。値の性質で部品を分け、＋−は初期値から少しだけ動かす数に留める。
// 背番号と年俸は量でなく「決まった数を書き写す」入力なので、数字パッドで直接入れる。10 から 55 へ 45 回押さない。
// パッドは欄を押して下から出すシートに置き、画面には 1 行の欄だけを残す。
// 身長、体重、入団年は範囲が広く連続した量なので、目盛りの物差しで流して合わせる。スライダーの 1 目盛り 3px では狙えない。

/// 3 列 4 段の数字パッド。電話と電卓で知られた並びにし、左下は用途ごとの鍵（年俸の「000」など）、右下は 1 字消す。
class DigitPad extends StatelessWidget {
  const DigitPad({super.key, required this.onDigits, required this.onBackspace, this.extra});

  /// 押した数字。「000」のような複数桁の鍵も同じ口で受ける。
  final ValueChanged<String> onDigits;
  final VoidCallback onBackspace;

  /// 左下の鍵。無ければ空ける。0 を中央の列に置き、電話の並びを崩さない。
  final String? extra;

  @override
  Widget build(BuildContext context) {
    Widget key(String label, {VoidCallback? onPressed, IconData? icon, String? semantics}) => Expanded(
      child: KeyButton(
        label: label,
        icon: icon,
        semanticsLabel: semantics ?? label,
        textStyle: Txt.figureSm,
        onPressed: onPressed ?? () => onDigits(label),
      ),
    );
    Widget row(List<Widget> keys) => Row(
      children: [
        for (var i = 0; i < keys.length; i++) ...[
          if (i > 0) const SizedBox(width: Space.s200),
          keys[i],
        ],
      ],
    );
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final r in const [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
        ]) ...[
          row([for (final d in r) key(d)]),
          // 鍵の下の影の余白 5 に 8 を足し、横の間（8 と影 5）と同じ 13 にする。
          const SizedBox(height: Space.s200),
        ],
        row([
          if (extra case final e?) key(e) else const Expanded(child: SizedBox()),
          key('0'),
          key('', icon: Icons.backspace_outlined, semantics: '1 字消す', onPressed: onBackspace),
        ]),
      ],
    );
  }
}

/// 数字パッドで打つ文字列。開いて最初の 1 字は今の値を置き換え、桁が埋まった後の 1 字は打ち直しにする。
class _Typing {
  _Typing(this.text);

  String text;
  bool fresh = true;

  /// 桁の上限を超える鍵は受けず、false を返す。maxValue があれば値の上限も見る。
  bool type(String digits, {required int maxLength, int? maxValue}) {
    final base = fresh || text.length >= maxLength ? '' : text;
    final next = base + digits;
    if (next.length > maxLength || (maxValue != null && int.parse(next) > maxValue)) return false;
    text = next;
    fresh = false;
    return true;
  }

  void backspace() {
    text = fresh || text.isEmpty ? '' : text.substring(0, text.length - 1);
    fresh = false;
  }

  void replace(String value) {
    text = value;
    fresh = true;
  }
}

void _tick(BuildContext context) {
  if (StoreScope.read(context).haptics) HapticFeedback.selectionClick();
}

/// 数字パッドのシート。値の欄を押すと下から出し、決定で閉じる。閉じれば入力の前の値のまま。
/// 画面にはパッドを常に置かず、欄は 1 行に留める。年に 1 度しか入れない数に、画面の半分を割かない。
Future<String?> _showPadSheet(
  BuildContext context, {
  required String title,
  required String initial,
  required int maxLength,
  required Widget Function(String text) preview,
  required String? Function(String text) validate,
  required String hint,
  int? maxValue,
  String? extra,
  Widget Function(String text, ValueChanged<String> replace)? above,
}) {
  final typing = _Typing(initial);
  String? error;
  return showModalBottomSheet<String>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    isScrollControlled: true,
    builder: (sheetContext) => StatefulBuilder(
      builder: (context, setState) {
        final p = Palette.of(context);
        void changed() {
          _tick(context);
          setState(() => error = null);
        }

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Semantics(header: true, child: Text(title, style: Txt.heading)),
                const SizedBox(height: Space.s300),
                Semantics(
                  liveRegion: true,
                  child: Center(child: _Pop(trigger: typing.text, child: preview(typing.text))),
                ),
                const SizedBox(height: Space.s150),
                // 決まりと誤りの行は常に確保し、誤りが出てもパッドを動かさない。
                Text(
                  error ?? hint,
                  textAlign: TextAlign.center,
                  style: Txt.caption.copyWith(
                    color: error == null ? p.onSurfaceVariant : p.error,
                    fontWeight: error == null ? FontWeight.w400 : FontWeight.w700,
                  ),
                ),
                if (above != null) ...[
                  const SizedBox(height: Space.s300),
                  above(typing.text, (v) {
                    typing.replace(v);
                    changed();
                  }),
                ],
                const SizedBox(height: Space.s300),
                DigitPad(
                  extra: extra,
                  onDigits: (d) {
                    if (typing.type(d, maxLength: maxLength, maxValue: maxValue)) changed();
                  },
                  onBackspace: () {
                    typing.backspace();
                    changed();
                  },
                ),
                const SizedBox(height: Space.s300),
                PressButton(
                  label: '決定',
                  kind: PressKind.primary,
                  onPressed: () {
                    final e = validate(typing.text);
                    if (e == null) {
                      Navigator.pop(sheetContext, typing.text);
                    } else {
                      setState(() => error = e);
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    ),
  );
}

/// シートで入れる数の欄。名前と、押せる面に今の値を 1 行に並べ、下に決まりか差の行を常に確保する。
class _PadField extends StatelessWidget {
  const _PadField({required this.label, required this.display, required this.note, required this.onPressed, this.error = false});

  final String label;
  final String display;
  final String note;
  final VoidCallback onPressed;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.s100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(child: Text(label, style: Txt.control)),
              KeyButton(
                label: display,
                expand: false,
                oneLine: true,
                icon: Icons.dialpad,
                textStyle: Txt.figureSm,
                semanticsLabel: '$label $display',
                semanticsHint: '数字パッドを開いて変えます',
                onPressed: onPressed,
              ),
            ],
          ),
          Text(
            note,
            textAlign: TextAlign.right,
            style: Txt.caption.copyWith(color: error ? p.error : p.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

/// 背番号の決まり。支配下は 0〜99 と 00、育成は 0 始まりを含む 3 桁（NPB の育成選手は 3 桁の番号を付ける）。
/// シーズンの終了では、育成から支配下へ上がることも残ることもあるので、どちらも受ける。
enum UniformRule {
  roster('0〜99 か 00'),
  development('育成選手は 3 桁（例: 012、123）'),
  either('支配下は 0〜99 か 00、育成は 3 桁');

  const UniformRule(this.hint);
  final String hint;

  int get maxLength => this == roster ? 2 : 3;

  String? check(String n) {
    if (n.isEmpty) return '背番号を入れてください。';
    final isRoster = RegExp(r'^(\d|[1-9]\d|00)$').hasMatch(n);
    final isDevelopment = RegExp(r'^\d{3}$').hasMatch(n);
    return switch (this) {
      roster when !isRoster => '背番号は 0〜99 か 00 です。',
      development when !isDevelopment => '育成選手の背番号は 3 桁です。',
      either when !isRoster && !isDevelopment => '背番号は 0〜99、00、3 桁のどれかです。',
      _ => null,
    };
  }
}

/// 背番号。欄を押すとシートのパッドで打つ。打つたびに札の数が跳ねて替わる。
class UniformNumberField extends StatelessWidget {
  const UniformNumberField({super.key, required this.value, required this.rule, required this.onChanged});

  final String value;
  final UniformRule rule;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final error = rule.check(value);
    return _PadField(
      label: '背番号',
      display: '#$value',
      note: error ?? rule.hint,
      error: error != null,
      onPressed: () async {
        final v = await _showPadSheet(
          context,
          title: '背番号',
          initial: value,
          maxLength: rule.maxLength,
          extra: '00',
          hint: rule.hint,
          validate: rule.check,
          // 札は横に広がる面なので、数の幅に縮めてシートの中央に置く。
          preview: (t) => IntrinsicWidth(child: JerseyBadge(t.isEmpty ? '−' : t, size: 96)),
        );
        if (v != null) onChanged(v);
      },
    );
  }
}

/// 年俸（万円）。欄を押すとシートのパッドで万円の数を打つ。左下の「000」で 1 億を「1」「000」「0」の 3 打で入れる。
/// base（今季の年俸）があれば、シートに今季からの変え幅の札を置き、欄の下に差の行を常に確保する。
class SalaryField extends StatelessWidget {
  const SalaryField({super.key, required this.value, required this.onChanged, this.label = '年俸', this.base});

  final int value;
  final ValueChanged<int> onChanged;
  final String label;
  final int? base;

  /// 上限は製品の 10 億円。下限は置かない。架空の選手の物語なので、0 円の契約も許す（製品の 300 万円から外した）。
  static const max = 100000;

  /// 今季からの変え幅。契約更改は前年からの増減で考えるため。据え置きを中央に、下げ幅は小さく、上げ幅は大きく取る。
  static const _rates = [-0.2, -0.1, 0.0, 0.1, 0.3, 0.5, 1.0];

  /// 変え幅を掛けた額。年俸の発表の刻みに合わせ、10 万円で丸める。
  static int _applied(int base, double rate) => ((base * (1 + rate)) / 10).round() * 10;

  static String _rateLabel(double rate) => switch (rate) {
    0 => '据え置き',
    1 => '2 倍',
    _ => '${rate > 0 ? '+' : '−'}${(rate.abs() * 100).round()}%',
  };

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final b = base;
    final diff = b == null ? 0 : value - b;
    return _PadField(
      label: label,
      display: salary(value),
      note: b == null
          ? ''
          : diff == 0
          ? '今季と同じ'
          : '今季から ${diff > 0 ? '+' : '−'}${salary(diff.abs())}',
      onPressed: () async {
        final v = await _showPadSheet(
          context,
          title: label,
          initial: '$value',
          maxLength: '$max'.length,
          maxValue: max,
          extra: '000',
          hint: '万円の数を打ちます。',
          validate: (_) => null,
          preview: (t) => Text(salary(int.tryParse(t) ?? 0), style: Txt.figure.copyWith(color: p.onSurface)),
          above: b == null
              ? null
              : (t, replace) => ChoiceWrap<double>(
                  semanticsLabel: '今季からの変え幅',
                  values: [
                    for (final r in _rates)
                      if (_applied(b, r) <= max) r,
                  ],
                  label: _rateLabel,
                  isSelected: (r) => '${_applied(b, r)}' == t,
                  onSelected: (r) => replace('${_applied(b, r)}'),
                ),
        );
        if (v != null) onChanged(int.parse(v));
      },
    );
  }
}

/// 目盛りの物差し。横に流して中央の針で値を読み、指を離すと近い目盛りへ吸い付く。
/// 1 目盛り 10px にし、スライダー（1 目盛り約 3px）より狙いやすくする。
class RulerField extends StatefulWidget {
  const RulerField({
    super.key,
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.unit,
    required this.onChanged,
    this.format,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final String unit;
  final ValueChanged<int> onChanged;

  /// 目盛りの数の書き方。年は桁区切りをしない。
  final String Function(int)? format;

  static const spacing = 10.0;
  static const height = 64.0;

  @override
  State<RulerField> createState() => _RulerFieldState();
}

class _RulerFieldState extends State<RulerField> {
  late final _controller = ScrollController(initialScrollOffset: _offsetOf(widget.value));
  bool _snapping = false;

  double _offsetOf(int v) => (v - widget.min) * RulerField.spacing;

  int get _current => (widget.min + (_controller.offset / RulerField.spacing).round()).clamp(widget.min, widget.max);

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(RulerField old) {
    super.didUpdateWidget(old);
    if (_controller.hasClients && _current != widget.value) _controller.jumpTo(_offsetOf(widget.value));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onScroll() {
    final v = _current;
    if (v == widget.value) return;
    _tick(context);
    widget.onChanged(v);
  }

  Future<void> _snap() async {
    if (_snapping) return;
    final target = _offsetOf(_current);
    if ((_controller.offset - target).abs() < 0.5) return;
    _snapping = true;
    await _controller.animateTo(
      target,
      duration: Motion.reduced(context) ? Duration.zero : Motion.state,
      curve: Motion.out,
    );
    _snapping = false;
  }

  void _set(int v) {
    final next = v.clamp(widget.min, widget.max);
    _controller.jumpTo(_offsetOf(next));
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final text = '${(widget.format ?? (v) => '$v')(widget.value)} ${widget.unit}';
    return Padding(
      padding: const EdgeInsets.only(bottom: Space.s300),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(widget.label, style: Txt.control),
              const Spacer(),
              Text(text, style: Txt.figureSm.copyWith(color: p.onSurface)),
            ],
          ),
          const SizedBox(height: Space.s150),
          Semantics(
            slider: true,
            label: widget.label,
            value: text,
            increasedValue: '${widget.value + 1} ${widget.unit}',
            decreasedValue: '${widget.value - 1} ${widget.unit}',
            onIncrease: () => _set(widget.value + 1),
            onDecrease: () => _set(widget.value - 1),
            excludeSemantics: true,
            child: Container(
              height: RulerField.height,
              decoration: BoxDecoration(
                color: p.surface,
                borderRadius: BorderRadius.circular(Bold.radius),
                border: Border.all(color: p.ink, width: Bold.border),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(Bold.radius - Bold.border),
                child: LayoutBuilder(
                  builder: (context, c) {
                    final half = c.maxWidth / 2;
                    return Stack(
                      children: [
                        // 両端を面の色へ溶かし、目盛りが続いていることを示す。
                        ShaderMask(
                          blendMode: BlendMode.dstIn,
                          shaderCallback: (rect) => const LinearGradient(
                            colors: [Color(0x00000000), Color(0xFF000000), Color(0xFF000000), Color(0x00000000)],
                            stops: [0, 0.18, 0.82, 1],
                          ).createShader(rect),
                          child: NotificationListener<ScrollEndNotification>(
                            onNotification: (_) {
                              _snap();
                              return false;
                            },
                            child: SingleChildScrollView(
                              controller: _controller,
                              scrollDirection: Axis.horizontal,
                              child: CustomPaint(
                                size: Size((widget.max - widget.min) * RulerField.spacing + half * 2, RulerField.height),
                                painter: _RulerPainter(
                                  min: widget.min,
                                  max: widget.max,
                                  inset: half,
                                  tick: p.onSurfaceVariant,
                                  major: p.onSurface,
                                  format: widget.format,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // 中央の針。主の色の三角と墨の線で、目盛りの色と分ける。
                        // 針は長い目盛り（22）より少し長い所で止め、下の数に重ねない。
                        Positioned(
                          left: half - 1.5,
                          top: 0,
                          child: IgnorePointer(child: Container(width: 3, height: 28, color: p.ink)),
                        ),
                        Positioned(
                          left: half - 8,
                          top: 0,
                          child: IgnorePointer(
                            child: CustomPaint(size: const Size(16, 10), painter: _NeedlePainter(p.primary, p.ink)),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RulerPainter extends CustomPainter {
  _RulerPainter({
    required this.min,
    required this.max,
    required this.inset,
    required this.tick,
    required this.major,
    this.format,
  });

  final int min;
  final int max;
  final double inset;
  final Color tick;
  final Color major;
  final String Function(int)? format;

  @override
  void paint(Canvas canvas, Size size) {
    final minor = Paint()
      ..color = tick
      ..strokeWidth = 1.5;
    final strong = Paint()
      ..color = major
      ..strokeWidth = 2.5;
    for (var v = min; v <= max; v++) {
      final x = inset + (v - min) * RulerField.spacing;
      // 10 ごとに長く太く数を添え、5 ごとに中くらいにする。数えずに桁が読める。
      final ten = v % 10 == 0;
      final five = v % 5 == 0;
      final length = ten ? 22.0 : (five ? 15.0 : 9.0);
      canvas.drawLine(Offset(x, 0), Offset(x, length), ten ? strong : minor);
      if (ten) {
        final tp = TextPainter(
          text: TextSpan(text: (format ?? (v) => '$v')(v), style: Txt.caption.merge(Txt.tabular).copyWith(color: major)),
          textDirection: TextDirection.ltr,
        )..layout();
        tp.paint(canvas, Offset(x - tp.width / 2, size.height - tp.height - Space.s150));
      }
    }
  }

  @override
  bool shouldRepaint(_RulerPainter old) =>
      old.min != min || old.max != max || old.inset != inset || old.tick != tick || old.major != major;
}

class _NeedlePainter extends CustomPainter {
  _NeedlePainter(this.fill, this.ink);

  final Color fill;
  final Color ink;

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();
    canvas.drawPath(path, Paint()..color = fill);
    canvas.drawPath(
      path,
      Paint()
        ..color = ink
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(_NeedlePainter old) => old.fill != fill || old.ink != ink;
}

/// 中身が替わるたびに、少し縮めてからばねで戻す。打った数が札に入った手応えにする。動きの抑制では動かさない。
class _Pop extends StatelessWidget {
  const _Pop({required this.trigger, required this.child});

  final Object trigger;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (Motion.reduced(context)) return child;
    return TweenAnimationBuilder<double>(
      key: ValueKey(trigger),
      tween: Tween(begin: 0.9, end: 1),
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutBack,
      builder: (context, s, child) => Transform.scale(scale: s, child: child),
      child: child,
    );
  }
}

