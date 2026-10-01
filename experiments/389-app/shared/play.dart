import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'data.dart';
import 'ds.dart';
import 'icons.dart';

// 3 案が共有するクイズの部品。v2 の Pattern C（成績表のカード、下端の帯）に従い、開示と外れの動きを足した。

/// 成績表。製品の StatsView と同じく、cyan の隅のアクセント、影、ドットグリッドを持つカードに、年度 × 項目を 1px の区切りで並べる。
/// 開いた値だけを cyan にし、年度は灰に下げて、開いた値が表の中で最も目立つようにする。
/// 開いた瞬間のマスは pink で大きく出て、600ms で cyan の定位置へ戻る。どこが開いたかを目で追えるようにするため。
/// 終わった後は全部を見せ、開かずに済んだマスを白にして、開いたマス（cyan）と分ける。
class StatsTable extends StatelessWidget {
  const StatsTable({required this.session, super.key, this.compact = false});

  final QuizSession session;

  /// 行を詰める。結果の画面で表を小さく見せるときに使う。
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final s = session;
    final rowH = compact ? 26.0 : 34.0;
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
              Text(h, textAlign: TextAlign.center, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary, fontSize: 11)),
          ]),
          const Divider(color: DsColor.surfaceBorder, thickness: DsBorder.thin, height: 12),
          for (var r = 0; r < s.yearCount; r++)
            Container(
              height: rowH,
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: DsColor.surfaceBorder.withValues(alpha: 0.35), width: 0.5))),
              child: _row([
                Text(
                  s.year(r),
                  textAlign: TextAlign.center,
                  style: s.year(r) == '通算'
                      ? DsTypography.caption.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)
                      : DsTypography.displayNumeric.copyWith(fontSize: 15, color: DsColor.contentSecondary),
                ),
                for (var c = 0; c < s.stats.length; c++)
                  StatCell(text: s.value(r, c), revealed: s.isRevealed(r, c), fresh: s.lastRevealed == (r, c) && !s.isOver, rest: s.isOver && !s.opened(r, c)),
              ]),
            ),
        ],
      ),
    );
  }

  Widget _row(List<Widget> cells) => Row(children: [for (final c in cells) Expanded(child: c)]);
}

class StatCell extends StatefulWidget {
  const StatCell({required this.text, required this.revealed, required this.fresh, super.key, this.rest = false});

  final String text;
  final bool revealed;
  final bool fresh;

  /// 終わった後に見せる、開かずに済んだマス。
  final bool rest;

  @override
  State<StatCell> createState() => _StatCellState();
}

class _StatCellState extends State<StatCell> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 600), value: 1);

  @override
  void didUpdateWidget(StatCell old) {
    super.didUpdateWidget(old);
    if (!old.revealed && widget.revealed && widget.fresh && !dsStill(context)) _t.forward(from: 0);
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.revealed) return const SizedBox.shrink();
    final team = !RegExp(r'^[\d.]+$').hasMatch(widget.text);
    return AnimatedBuilder(
      animation: _t,
      builder: (context, _) {
        final v = _t.value;
        final pop = Curves.easeOutBack.transform((v / 0.45).clamp(0, 1));
        final settle = Curves.easeOut.transform(((v - 0.45) / 0.55).clamp(0, 1));
        final color = widget.rest ? DsColor.contentPrimary.withValues(alpha: 0.72) : Color.lerp(DsColor.actionEmphasis, DsColor.actionPrimary, widget.fresh ? settle : 1)!;
        return Stack(
          alignment: Alignment.center,
          children: [
            if (v < 0.6)
              Opacity(
                opacity: (1 - v / 0.6) * 0.5,
                child: Transform.scale(
                  scale: 0.6 + v,
                  child: Container(decoration: BoxDecoration(border: Border.all(color: DsColor.actionEmphasis, width: 2), borderRadius: DsRadius.borderXs)),
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
                    style: team
                        ? DsTypography.body2.copyWith(color: color, fontWeight: FontWeight.w700)
                        : DsTypography.displayNumeric.copyWith(fontSize: 17, color: color),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// いま当てたときのランクを、SS〜C の 5 枠の札で示す。いまの枠だけをランクの色で塗り、下がるまでのマス数を添える。
/// 誤答でもランクは落ちるので、session.rankNow から出す。
class RankMeter extends StatefulWidget {
  const RankMeter({required this.session, super.key, this.labels});

  final QuizSession session;

  /// 枠のラベルの読み替え（打球の名など）。null ならランクの記号。
  final String Function(Rank)? labels;

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
    final s = widget.session;
    final now = s.rankNow;
    final left = s.cellsBeforeDrop;
    final next = Rank.values[math.min(now.index + 1, Rank.c.index)];
    final label = widget.labels ?? (r) => r.label;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Text('いま当てれば', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
            const Spacer(),
            Text(
              left == null ? 'これより下はない' : (left <= 0 ? '次の 1 マスで ${label(next)}' : 'あと $left マスで ${label(next)}'),
              style: DsTypography.caption.copyWith(color: left != null && left <= 0 ? DsColor.actionEmphasis : DsColor.contentSecondary),
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
                        style: (widget.labels == null ? DsTypography.displayNumeric.copyWith(fontSize: 15) : DsTypography.caption.copyWith(fontWeight: FontWeight.w700)).copyWith(
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

/// 回答のシート。名前の一部で候補を出し、外れた名前は消して選べなくする。
Future<String?> showAnswerSheet(BuildContext context, {required List<String> wrong, String title = '選手を回答する'}) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _AnswerSheet(wrong: wrong, title: title),
  );
}

class _AnswerSheet extends StatefulWidget {
  const _AnswerSheet({required this.wrong, required this.title});

  final List<String> wrong;
  final String title;

  @override
  State<_AnswerSheet> createState() => _AnswerSheetState();
}

class _AnswerSheetState extends State<_AnswerSheet> {
  final _text = TextEditingController();

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
      child: DsSurface(
        backgroundColor: DsColor.background,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(DsRadius.lg)),
        accentColor: DsColor.actionPrimary,
        accentPosition: DsCorner.topRight,
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.title, style: DsTypography.headline4.copyWith(color: DsColor.contentPrimary)),
                const SizedBox(height: DsSpacing.space12),
                TextField(
                  controller: _text,
                  autofocus: true,
                  onChanged: (_) => setState(() {}),
                  style: DsTypography.body1.copyWith(color: DsColor.contentPrimary),
                  decoration: InputDecoration(
                    hintText: '選手名の一部（例: 柳田）',
                    hintStyle: DsTypography.body1.copyWith(color: DsColor.disabledContent),
                    prefixIcon: const Padding(padding: EdgeInsets.all(12), child: DsIcon(DsGlyph.search, size: 22, color: DsColor.contentSecondary)),
                    filled: true,
                    fillColor: DsColor.surface,
                    enabledBorder: const OutlineInputBorder(borderRadius: DsRadius.borderSm, borderSide: BorderSide(color: DsColor.surfaceBorder)),
                    focusedBorder: const OutlineInputBorder(borderRadius: DsRadius.borderSm, borderSide: BorderSide(color: DsColor.actionPrimary, width: DsBorder.standard)),
                  ),
                ),
                const SizedBox(height: DsSpacing.space8),
                SizedBox(
                  height: 280,
                  child: hits.isEmpty
                      ? Align(
                          alignment: Alignment.topLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(top: 8, left: 4),
                            child: Text(
                              _text.text.isEmpty ? '姓だけでも探せます。外れても、何度でも回答できます。' : '「${_text.text}」に当たる選手がいません。漢字の表記を確かめてください。',
                              style: DsTypography.body2.copyWith(color: DsColor.contentSecondary),
                            ),
                          ),
                        )
                      : ListView.separated(
                          itemCount: hits.length,
                          separatorBuilder: (_, _) => const SizedBox(height: DsSpacing.space8),
                          itemBuilder: (context, i) {
                            final n = hits[i];
                            final miss = widget.wrong.contains(n);
                            return GestureDetector(
                              onTap: miss ? null : () => Navigator.pop(context, n),
                              child: DsSurface(
                                backgroundColor: miss ? DsColor.background : DsColor.surface,
                                borderColor: miss ? DsColor.disabledSurface : DsColor.surfaceBorder,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(
                                  children: [
                                    Text(
                                      n,
                                      style: DsTypography.body1.copyWith(
                                        color: miss ? DsColor.disabledContent : DsColor.contentPrimary,
                                        decoration: miss ? TextDecoration.lineThrough : null,
                                        decorationColor: DsColor.disabledContent,
                                      ),
                                    ),
                                    const Spacer(),
                                    if (miss)
                                      const DsBadge(label: '外れ', color: DsColor.incorrect)
                                    else
                                      const DsIcon(DsGlyph.chevronRight, size: 20, color: DsColor.actionPrimary),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// クイズの補助の操作（すべて表示、あきらめる）。返り値は 'all' か 'give'。
Future<String?> showQuizMenu(BuildContext context, {required bool canRevealAll, bool canGiveUp = true}) {
  return showModalBottomSheet<String>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) => DsSurface(
      backgroundColor: DsColor.background,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(DsRadius.lg)),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (canRevealAll) ...[
                DsButton(label: 'すべて表示する', type: DsButtonType.outline, icon: DsGlyph.eye, onPressed: () => Navigator.pop(context, 'all')),
                const SizedBox(height: 6),
                Text('当てても C になります', textAlign: TextAlign.center, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                const SizedBox(height: DsSpacing.space12),
              ],
              if (canGiveUp) ...[
                Text('あきらめると不正解として記録され、答えと全部の成績を見られます。', style: DsTypography.body2.copyWith(color: DsColor.contentSecondary)),
                const SizedBox(height: DsSpacing.space12),
                DsButton(label: 'あきらめて答えを見る', type: DsButtonType.danger, icon: DsGlyph.flag, onPressed: () => Navigator.pop(context, 'give')),
              ],
            ],
          ),
        ),
      ),
    ),
  );
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
    child: ExcludeSemantics(child: CustomPaint(painter: _ConfettiPainter(_t, widget.burst), child: const SizedBox.expand())),
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
void showShareNote(BuildContext context, String what) {
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
          child: Text('製品では、$whatを画像にして OS の共有シートを開く。試作では開かない。', style: DsTypography.body2.copyWith(color: DsColor.contentPrimary)),
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
      child: SlideTransition(position: Tween(begin: const Offset(0, 0.03), end: Offset.zero).animate(c), child: child),
    );
  },
);

QuizSession randomSession() => QuizSession(player: quizPlayers[DateTime.now().microsecond % quizPlayers.length]);
