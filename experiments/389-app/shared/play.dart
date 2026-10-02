import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'data.dart';
import 'ds.dart';
import 'icons.dart';

// 3 案が共有するクイズの部品。v2 の Pattern C（成績表のカード、下端の帯）に従い、開示と外れの動きを足した。

/// 成績表。製品の StatsView と同じく、cyan の隅のアクセント、影、ドットグリッドを持つカードに、年度 × 項目を 1px の区切りで並べる。
/// 遊んでいる間は、開いた値だけを cyan にし、年度は灰に下げて、開いた値が表の中で最も目立つようにする。
/// 開いた瞬間のマスは pink で大きく出て、600ms で cyan の定位置へ戻る。どこが開いたかを目で追えるようにするため。
class StatsTable extends StatelessWidget {
  const StatsTable({required this.session, super.key, this.compact = false, this.mono = false, this.cascade = false, this.rowHeight});

  final QuizSession session;

  /// 行を詰める。結果の画面で表を小さく見せるときに使う。
  final bool compact;

  /// 文字を 1 色（白）にする。結果の画面で、答えの成績として読ませるときに使う。
  final bool mono;

  /// 正解した瞬間に、開いていないマスを左上から斜めの波で開く。
  final bool cascade;

  /// 行の高さの上書き。クイズでは画面に収まる高さを渡す。
  final double? rowHeight;

  /// 波の 1 段の間隔。17 行 × 5 列で約 0.6 秒になる。
  static const waveStep = Duration(milliseconds: 28);

  /// 波が最後のマスまで届くまでの時間。
  static Duration waveLength(QuizSession s) => waveStep * (s.yearCount + s.stats.length) + const Duration(milliseconds: 220);

  @override
  Widget build(BuildContext context) {
    final s = session;
    final rowH = rowHeight ?? (compact ? 26.0 : 34.0);
    final yearColor = mono ? DsColor.contentPrimary : DsColor.contentSecondary;
    return DsCard(
      accentColor: DsColor.actionPrimary,
      hasShadow: true,
      showDotGrid: true,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _row([
            for (final h in ['年度', ...s.stats])
              Text(
                h,
                textAlign: TextAlign.center,
                style: DsTypography.caption.copyWith(color: DsColor.contentSecondary, fontSize: 11),
              ),
          ]),
          const Divider(color: DsColor.surfaceBorder, thickness: DsBorder.thin, height: 12),
          for (var r = 0; r < s.yearCount; r++)
            Container(
              height: rowH,
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: DsColor.surfaceBorder.withValues(alpha: 0.35), width: 0.5)),
              ),
              child: _row([
                Text(
                  s.year(r),
                  textAlign: TextAlign.center,
                  style: s.year(r) == '通算'
                      ? DsTypography.caption.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)
                      : DsTypography.displayNumeric.copyWith(fontSize: 15, color: yearColor),
                ),
                for (var c = 0; c < s.stats.length; c++)
                  StatCell(
                    text: s.value(r, c),
                    revealed: s.isRevealed(r, c),
                    fresh: s.lastRevealed == (r, c) && !s.isOver,
                    color: mono || (s.isOver && !s.opened(r, c)) ? DsColor.contentPrimary : DsColor.actionPrimary,
                    wave: cascade && !s.opened(r, c) ? const Duration(milliseconds: 240) + waveStep * (r + c) : null,
                  ),
              ]),
            ),
        ],
      ),
    );
  }

  Widget _row(List<Widget> cells) => Row(children: [for (final c in cells) Expanded(child: c)]);
}

class StatCell extends StatefulWidget {
  const StatCell({required this.text, required this.revealed, required this.fresh, required this.color, super.key, this.wave});

  final String text;
  final bool revealed;

  /// 遊んでいる間に、いま開いたマス。pink で大きく出てから color へ落ち着く。
  final bool fresh;
  final Color color;

  /// 正解の波で開くまでの待ち。null なら波に乗らない。
  final Duration? wave;

  @override
  State<StatCell> createState() => _StatCellState();
}

class _StatCellState extends State<StatCell> with TickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 600), value: 1);

  /// 波で開く動き。下から 6px 持ち上がりながら現れる（220ms）。
  late final _w = AnimationController(vsync: this, duration: const Duration(milliseconds: 220), value: 1);

  @override
  void didUpdateWidget(StatCell old) {
    super.didUpdateWidget(old);
    if (old.revealed || !widget.revealed || dsStill(context)) return;
    if (widget.wave != null) {
      _w.value = 0;
      Future<void>.delayed(widget.wave!, () {
        if (mounted) _w.forward();
      });
    } else if (widget.fresh) {
      _t.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _t.dispose();
    _w.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.revealed) return const SizedBox.shrink();
    final team = !RegExp(r'^[\d.]+$').hasMatch(widget.text);
    return AnimatedBuilder(
      animation: Listenable.merge([_t, _w]),
      builder: (context, _) {
        final v = _t.value;
        final w = Curves.easeOut.transform(_w.value);
        final pop = Curves.easeOutBack.transform((v / 0.45).clamp(0, 1));
        final settle = Curves.easeOut.transform(((v - 0.45) / 0.55).clamp(0, 1));
        final color = widget.fresh ? Color.lerp(DsColor.actionEmphasis, widget.color, settle)! : widget.color;
        return Opacity(
          opacity: w,
          child: Transform.translate(
            offset: Offset(0, (1 - w) * 6),
            child: Stack(
              alignment: Alignment.center,
              children: [
                if (v < 0.6)
                  Opacity(
                    opacity: (1 - v / 0.6) * 0.5,
                    child: Transform.scale(
                      scale: 0.6 + v,
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: DsColor.actionEmphasis, width: 2),
                          borderRadius: DsRadius.borderXs,
                        ),
                      ),
                    ),
                  ),
                Transform.scale(
                  scale: 1.6 - 0.6 * pop,
                  child: Opacity(
                    opacity: (v / 0.2).clamp(0, 1),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        widget.text,
                        maxLines: 1,
                        style: team ? DsTypography.body2.copyWith(color: color, fontWeight: FontWeight.w700) : DsTypography.displayNumeric.copyWith(fontSize: 17, color: color),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// 現在のランクを、SS〜C の 5 枠の札で示す。いまの枠だけをランクの色で塗り、届かなくなった枠は打ち消す。
/// 誤答でもランクは落ちるので、session.rankNow から出す。
class RankMeter extends StatefulWidget {
  const RankMeter({required this.session, super.key, this.labels, this.wrongNames = const []});

  final QuizSession session;

  /// 枠のラベルの読み替え。null ならランクの記号。
  final String Function(Rank)? labels;

  /// 外れた名前。見出しの行の右に 1 行で出す。行は常にあるので、外しても表は動かない。
  final List<String> wrongNames;

  @override
  State<RankMeter> createState() => _RankMeterState();
}

class _RankMeterState extends State<RankMeter> with SingleTickerProviderStateMixin {
  late final _drop = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
  late Rank _last = widget.session.rankNow;

  @override
  void didUpdateWidget(RankMeter old) {
    super.didUpdateWidget(old);
    final now = widget.session.rankNow;
    if (now != _last) {
      _last = now;
      if (!dsStill(context)) _drop.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _drop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final now = widget.session.rankNow;
    final label = widget.labels ?? (r) => r.label;
    return Semantics(
      label: '現在のランク ${now.label}${widget.wrongNames.isEmpty ? '' : '。外れ ${widget.wrongNames.join('、')}'}',
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('現在のランク', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
              const SizedBox(width: DsSpacing.space12),
              // 外れた名前は区切り文字でつながず、小さな札に分けて新しい順に並べる。収まらない札は左で切る。
              Expanded(
                child: SizedBox(
                  height: 20,
                  child: ClipRect(
                    child: OverflowBox(
                      alignment: Alignment.centerRight,
                      maxWidth: double.infinity,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          for (final n in widget.wrongNames) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              decoration: BoxDecoration(
                                border: Border.all(color: DsColor.incorrect),
                                borderRadius: DsRadius.borderXs,
                              ),
                              child: Text(n, style: DsTypography.overline.copyWith(color: DsColor.incorrect, letterSpacing: 0, height: 1.6)),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: DsSpacing.space4),
          Row(
            children: [
              for (final r in const [Rank.ss, Rank.s, Rank.a, Rank.b, Rank.c]) ...[
                Expanded(
                  child: AnimatedBuilder(
                    animation: _drop,
                    builder: (context, child) => Transform.translate(offset: Offset(0, r == now ? -math.sin(_drop.value * math.pi) * 4 : 0), child: child),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      height: 28,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: r == now ? dsRankColor(r.label) : (r.index < now.index ? DsColor.background : DsColor.surface),
                        borderRadius: DsRadius.borderXs,
                        border: Border.all(color: r == now ? DsColor.onAction : DsColor.disabledSurface, width: r == now ? DsBorder.standard : DsBorder.thin),
                        boxShadow: r == now ? DsShadow.xs : null,
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          label(r),
                          style: DsTypography.displayNumeric.copyWith(
                            fontSize: 15,
                            color: r == now ? DsColor.onAction : (r.index < now.index ? DsColor.disabledContent : dsRankColor(r.label)),
                            decoration: r.index < now.index ? TextDecoration.lineThrough : null,
                            decorationColor: DsColor.disabledContent,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                if (r != Rank.c) const SizedBox(width: DsSpacing.space4),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// 外れを知らせる帯。ダイアログで止めず、表の上に 1.6 秒だけ降ろす。
class MissBanner extends StatefulWidget {
  const MissBanner({required this.name, required this.trigger, super.key, this.extra});

  final String? name;

  /// 値が変わるたびに降ろし直す。
  final int trigger;
  final String? extra;

  @override
  State<MissBanner> createState() => _MissBannerState();
}

class _MissBannerState extends State<MissBanner> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600));

  @override
  void didUpdateWidget(MissBanner old) {
    super.didUpdateWidget(old);
    if (old.trigger != widget.trigger && widget.name != null) _t.forward(from: 0);
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _t,
      builder: (context, _) {
        final v = _t.value;
        if (v == 0 || v == 1 || widget.name == null) return const SizedBox.shrink();
        final inT = Curves.easeOutBack.transform((v / 0.18).clamp(0, 1));
        final outT = Curves.easeIn.transform(((v - 0.82) / 0.18).clamp(0, 1));
        return IgnorePointer(
          child: Transform.translate(
            offset: Offset(math.sin(v * 60) * 6 * (1 - (v / 0.3).clamp(0, 1)), -60 * (1 - inT) - 60 * outT),
            child: Opacity(
              opacity: 1 - outT,
              child: DsSurface(
                backgroundColor: DsColor.incorrect,
                borderColor: DsColor.onAction,
                borderWidth: DsBorder.standard,
                shadow: DsShadow.medium,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const DsIcon(DsGlyph.close, color: DsColor.onAction, size: 22),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '残念… ${widget.name} 選手ではありません${widget.extra == null ? '' : '\n${widget.extra}'}',
                        style: DsTypography.body2.copyWith(color: DsColor.onAction, fontWeight: FontWeight.w700, height: 1.35),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// 回答のシート。名前の一部で候補を出し、選んだ候補を「回答する」で送る。外れた名前は消して選べなくする。
/// 候補を押しただけでは送らない。押し間違えで 1 回ぶんの回答を失わないようにするため。
Future<String?> showAnswerSheet(BuildContext context, {required List<String> wrong}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _AnswerSheet(wrong: wrong),
  );
}

class _AnswerSheet extends StatefulWidget {
  const _AnswerSheet({required this.wrong});

  final List<String> wrong;

  @override
  State<_AnswerSheet> createState() => _AnswerSheetState();
}

class _AnswerSheetState extends State<_AnswerSheet> {
  final _text = TextEditingController();
  String? _selected;

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hits = searchNames(_text.text);
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: _SheetSurface(
        title: '選手を回答',
        children: [
          Text('一部でも検索できます', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
          const SizedBox(height: DsSpacing.space8),
          TextField(
            controller: _text,
            autofocus: true,
            onChanged: (_) => setState(() => _selected = null),
            style: DsTypography.body1.copyWith(color: DsColor.contentPrimary),
            decoration: InputDecoration(
              hintText: '例: 佐藤',
              hintStyle: DsTypography.body1.copyWith(color: DsColor.disabledContent),
              prefixIcon: const Padding(
                padding: EdgeInsets.all(12),
                child: DsIcon(DsGlyph.search, size: 22, color: DsColor.contentSecondary),
              ),
              filled: true,
              fillColor: DsColor.surface,
              enabledBorder: const OutlineInputBorder(
                borderRadius: DsRadius.borderSm,
                borderSide: BorderSide(color: DsColor.surfaceBorder),
              ),
              focusedBorder: const OutlineInputBorder(
                borderRadius: DsRadius.borderSm,
                borderSide: BorderSide(color: DsColor.actionPrimary, width: DsBorder.standard),
              ),
            ),
          ),
          const SizedBox(height: DsSpacing.space8),
          SizedBox(
            height: 248,
            child: hits.isEmpty
                ? Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(
                      _text.text.isEmpty ? '' : '該当する選手がいません',
                      textAlign: TextAlign.center,
                      style: DsTypography.body2.copyWith(color: DsColor.contentSecondary),
                    ),
                  )
                : ListView.separated(
                    itemCount: hits.length,
                    separatorBuilder: (_, _) => const SizedBox(height: DsSpacing.space8),
                    itemBuilder: (context, i) {
                      final n = hits[i];
                      final miss = widget.wrong.contains(n);
                      final on = n == _selected;
                      return Semantics(
                        selected: on,
                        enabled: !miss,
                        button: true,
                        child: GestureDetector(
                          onTap: miss ? null : () => setState(() => _selected = on ? null : n),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 120),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: on ? DsColor.actionPrimary : (miss ? DsColor.background : DsColor.surface),
                              borderRadius: DsRadius.borderSm,
                              border: Border.all(color: on ? DsColor.onAction : (miss ? DsColor.disabledSurface : DsColor.surfaceBorder), width: on ? DsBorder.standard : DsBorder.thin),
                              boxShadow: on ? DsShadow.xs : null,
                            ),
                            child: Row(
                              children: [
                                Text(
                                  n,
                                  style: DsTypography.body1.copyWith(
                                    color: on ? DsColor.onAction : (miss ? DsColor.disabledContent : DsColor.contentPrimary),
                                    fontWeight: on ? FontWeight.w700 : null,
                                    decoration: miss ? TextDecoration.lineThrough : null,
                                    decorationColor: DsColor.disabledContent,
                                  ),
                                ),
                                const Spacer(),
                                if (miss) const DsBadge(label: '外れ', color: DsColor.incorrect),
                                if (on) const DsIcon(DsGlyph.check, size: 20, color: DsColor.onAction),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: DsSpacing.space12),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: DsButton(label: 'キャンセル', type: DsButtonType.outline, onPressed: () => Navigator.pop(context)),
              ),
              const SizedBox(width: DsSpacing.space8),
              Expanded(
                flex: 3,
                child: DsButton(label: '回答する', icon: DsGlyph.baseball, onPressed: _selected == null ? null : () => Navigator.pop(context, _selected)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// シートの面。題と、右上の閉じるボタンを持つ。
class _SheetSurface extends StatelessWidget {
  const _SheetSurface({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => DsSurface(
    backgroundColor: DsColor.background,
    borderRadius: const BorderRadius.vertical(top: Radius.circular(DsRadius.lg)),
    child: SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 8, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(title, style: DsTypography.headline4.copyWith(color: DsColor.contentPrimary)),
                ),
                DsHeaderIconButton(icon: DsGlyph.close, tooltip: '閉じる', onPressed: () => Navigator.pop(context)),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
            ),
          ],
        ),
      ),
    ),
  );
}

/// 取り消せる操作の確認。題、何が起きるかの 1 文、「キャンセル」と実行のボタンを並べる。実行したら true を返す。
Future<bool> showConfirmSheet(BuildContext context, {required String title, required String body, required String action, bool danger = false, List<String> notes = const []}) async {
  final ok = await showModalBottomSheet<bool>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) => _SheetSurface(
      title: title,
      children: [
        if (body.isNotEmpty) Text(body, style: DsTypography.body2.copyWith(color: DsColor.contentSecondary)),
        // 注意書きは、区切り文字でなく行頭の印で 1 行ずつ分ける。
        for (final n in notes)
          Padding(
            padding: const EdgeInsets.only(top: DsSpacing.space8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 7, right: 10),
                  child: DsStatusDot(color: DsColor.actionEmphasis, size: 6),
                ),
                Expanded(
                  child: Text(n, style: DsTypography.body2.copyWith(color: DsColor.contentPrimary)),
                ),
              ],
            ),
          ),
        const SizedBox(height: DsSpacing.space20),
        Row(
          children: [
            Expanded(
              child: DsButton(label: 'キャンセル', type: DsButtonType.outline, onPressed: () => Navigator.pop(context, false)),
            ),
            const SizedBox(width: DsSpacing.space8),
            Expanded(
              child: DsButton(label: action, type: danger ? DsButtonType.danger : DsButtonType.primary, onPressed: () => Navigator.pop(context, true)),
            ),
          ],
        ),
      ],
    ),
  );
  return ok ?? false;
}

/// 正解の紙吹雪。製品の CustomConfettiWidget の 4 色で、上から 1 回だけ降らせる。
class Confetti extends StatefulWidget {
  const Confetti({super.key, this.burst = 60});

  final int burst;

  @override
  State<Confetti> createState() => _ConfettiState();
}

class _ConfettiState extends State<Confetti> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 2600));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!dsStill(context) && _t.value == 0 && !_t.isAnimating) _t.forward();
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => IgnorePointer(
    child: ExcludeSemantics(
      child: CustomPaint(painter: _ConfettiPainter(_t, widget.burst), child: const SizedBox.expand()),
    ),
  );
}

class _ConfettiPainter extends CustomPainter {
  _ConfettiPainter(this.t, this.n) : super(repaint: t);

  final Animation<double> t;
  final int n;

  @override
  void paint(Canvas canvas, Size size) {
    if (t.value == 0 || t.value == 1) return;
    final r = math.Random(21);
    const colors = [DsColor.actionPrimary, DsColor.actionEmphasis, DsColor.rankHighlight, DsColor.statusSuccess];
    for (var i = 0; i < n; i++) {
      final x0 = r.nextDouble() * size.width;
      final vx = (r.nextDouble() - 0.5) * 120;
      final delay = r.nextDouble() * 0.25;
      final p = ((t.value - delay) / (1 - delay)).clamp(0.0, 1.0);
      if (p == 0) continue;
      final y = -20 + p * p * (size.height * 0.9) + math.sin(p * 10 + i) * 8;
      final x = x0 + vx * p;
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(p * 8 + i);
      canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: 8, height: 4), Paint()..color = colors[i % 4].withValues(alpha: 1 - p * 0.6));
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => false;
}

/// 製品では OS の共有シートを開く操作。試作では説明だけを出す。
void showShareNote(BuildContext context, String what) => showProductNote(context, '製品では、$whatを画像にして OS の共有シートを開く。試作では開かない。');

/// 製品では外の画面を開く操作。試作では説明だけを出す。
void showProductNote(BuildContext context, String text) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (_) => DsSurface(
      backgroundColor: DsColor.background,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(DsRadius.lg)),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(text, style: DsTypography.body2.copyWith(color: DsColor.contentPrimary)),
        ),
      ),
    ),
  );
}

/// 週の 7 日のドット。製品の WeeklyPlayDots と同じく、遊んだ日を塗り、遊んでいない日はリングにする。
class WeekDots extends StatelessWidget {
  const WeekDots({required this.days, required this.today, super.key, this.color = DsColor.statusSuccess});

  final Set<int> days;
  final int today;
  final Color color;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      for (var i = 0; i < 7; i++)
        Column(
          children: [
            Text('月火水木金土日'[i], style: DsTypography.overline.copyWith(color: i == today ? DsColor.contentPrimary : DsColor.contentSecondary, letterSpacing: 0)),
            const SizedBox(height: DsSpacing.space4),
            DsStatusDot(color: days.contains(i) ? color : DsColor.disabledContent, size: 12, outlined: !days.contains(i)),
          ],
        ),
    ],
  );
}

PageRoute<void> dsRoute(Widget screen) => PageRouteBuilder<void>(
  transitionDuration: const Duration(milliseconds: 240),
  reverseTransitionDuration: const Duration(milliseconds: 180),
  pageBuilder: (_, _, _) => screen,
  transitionsBuilder: (_, a, _, child) {
    final c = CurvedAnimation(parent: a, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: c,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.03), end: Offset.zero).animate(c),
        child: child,
      ),
    );
  },
);

QuizSession randomSession() => QuizSession(player: quizPlayers[DateTime.now().microsecond % quizPlayers.length]);
