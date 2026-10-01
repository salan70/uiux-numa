import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/ds.dart';
import '../../shared/parts.dart';
import '../../shared/play.dart';
import '../../shared/profile.dart';
import '../../shared/quiz_screen.dart';

// atbat: 製品の比喩「遊ぶ人は打者、正解率は打率」（docs/design/2026-08-12-play-stats-ia-redesign-design.md）を、1 問の中まで通す。
// 1 問を 1 打席とし、ランクを打球に読み替える。SS は本塁打、S は三塁打、A は二塁打、B は単打、C は内野安打、不正解は凡退。
// 結果では走者が塁を回り、打率と長打率がその場で動く。1 問の結果が、自分の成績に積み上がることを見せるため。
// 今日の1問の 3 回はアウトカウントにする。造形は v2 のまま、ダイヤモンドの図だけを足した。

Widget buildVariant() => QuizApp(title: '.389', theme: buildDsTheme(), screens: _screens);

Widget buildPanel() => const JumpPanel();

final _screens = <String, WidgetBuilder>{
  'home': (_) => const _Home(),
  'quiz': (_) => _quiz(sampleSession()),
  'quizMid': (_) => _quiz(sampleSession(reveal: 7)),
  'answer': (_) => _quiz(sampleSession(reveal: 7), openAnswer: true),
  'wrong': (_) => _quiz(_wrong(sampleSession(reveal: 7))),
  'result': (_) => _Result(session: _won(sampleSession(reveal: 5))),
  'daily': (_) => _quiz(_wrong(sampleSession(reveal: 4, mode: QuizMode.daily))),
  'dailyFail': (_) => _Result(session: _failed(sampleSession(reveal: 12, mode: QuizMode.daily))),
  'stats': (_) => const _Batting(),
};

QuizSession _wrong(QuizSession s) => s..guess(s.player.name == '山田 哲人' ? '坂本 勇人' : '山田 哲人');
QuizSession _won(QuizSession s) => s..guess(s.player.name);
QuizSession _failed(QuizSession s) {
  for (final n in ['山田 哲人', '近藤 健介', '浅村 栄斗']) {
    s.guess(n);
  }
  return s;
}

String _hit(Rank r) => switch (r) {
  Rank.ss => '本塁打',
  Rank.s => '三塁打',
  Rank.a => '二塁打',
  Rank.b => '単打',
  Rank.c => '内野安打',
  Rank.miss => '凡退',
};

/// スコアブックの 1 文字。
String _mark(Rank r) => switch (r) {
  Rank.ss => '本',
  Rank.s => '三',
  Rank.a => '二',
  Rank.b => '単',
  Rank.c => '内',
  Rank.miss => '凡',
};

int _bases(Rank r) => switch (r) {
  Rank.ss => 4,
  Rank.s => 3,
  Rank.a => 2,
  Rank.b || Rank.c => 1,
  Rank.miss => 0,
};

int get _totalBases => profile.records.fold(0, (a, r) => a + _bases(r.rank));

String _slg(int tb, int ab) {
  if (ab == 0) return '.000';
  final v = tb / ab;
  return v >= 1 ? v.toStringAsFixed(3) : rateText(v);
}

Widget _quiz(QuizSession s, {bool openAnswer = false}) => QuizScreen(
  session: s,
  openAnswer: openAnswer,
  onFinish: (s) => _Result(session: s),
  meterLabels: _hit,
  trailing: (s) => s.mode == QuizMode.daily ? _Outs(count: s.incorrect) : const SizedBox.shrink(),
  above: (s) => _AtBatStrip(session: s),
  missExtra: (s) => s.mode == QuizMode.daily ? '${s.incorrect} アウト' : null,
);

QuizSession _daily() => QuizSession(player: quizPlayers[profile.dailyNumber % quizPlayers.length], mode: QuizMode.daily, seed: profile.dailyNumber);

/// アウトカウント。製品の電光掲示板の O の並びに倣い、取られたアウトを pink で灯す。
class _Outs extends StatelessWidget {
  const _Outs({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) => Semantics(
    label: '$count アウト',
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('O', style: DsTypography.displayNumeric.copyWith(fontSize: 16, color: DsColor.contentSecondary)),
        const SizedBox(width: 6),
        for (var i = 0; i < 3; i++) ...[DsStatusDot(color: i < count ? DsColor.incorrect : DsColor.disabledContent, size: 12, outlined: i >= count), const SizedBox(width: 4)],
      ],
    ),
  );
}

/// クイズの上の帯。打席の番号と、いま当てたときに届く塁をダイヤモンドで示す。
class _AtBatStrip extends StatelessWidget {
  const _AtBatStrip({required this.session});

  final QuizSession session;

  @override
  Widget build(BuildContext context) {
    final r = session.rankNow;
    return Padding(
      padding: const EdgeInsets.only(bottom: DsSpacing.space12),
      child: Row(
        children: [
          SizedBox(width: 44, height: 44, child: CustomPaint(painter: _DiamondPainter(lit: _bases(r), color: dsRankColor(r.label)))),
          const SizedBox(width: DsSpacing.space12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(session.mode == QuizMode.daily ? '今日の打席' : '第 ${profile.plays + 1} 打席', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  transitionBuilder: (child, a) => FadeTransition(
                    opacity: a,
                    child: SlideTransition(position: Tween(begin: const Offset(0, 0.4), end: Offset.zero).animate(a), child: child),
                  ),
                  child: Text(
                    '${_hit(r)}コース',
                    key: ValueKey(r),
                    style: DsTypography.headline4.copyWith(color: dsRankColor(r.label), height: 1.2),
                  ),
                ),
              ],
            ),
          ),
          DsStat(label: '打率', value: profile.average, size: 22, colors: averageColors(profile.average)),
        ],
      ),
    );
  }
}

/// ダイヤモンド。lit の数だけ塁を灯す（4 で本塁まで）。runner は 0〜4 の走者の位置で、null なら走者を描かない。
class _DiamondPainter extends CustomPainter {
  _DiamondPainter({required this.lit, required this.color, this.runner});

  final int lit;
  final Color color;
  final double? runner;

  static List<Offset> corners(Size s) => [
    Offset(s.width / 2, s.height * 0.92),
    Offset(s.width * 0.92, s.height / 2),
    Offset(s.width / 2, s.height * 0.08),
    Offset(s.width * 0.08, s.height / 2),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final c = corners(size);
    final line = Paint()
      ..color = DsColor.disabledSurface
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width / 30;
    final path = Path()..addPolygon(c, true);
    canvas.drawPath(path, line);
    // 走った道を灯す。
    final run = runner ?? lit.toDouble();
    if (run > 0) {
      final trail = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width / 22
        ..strokeCap = StrokeCap.round;
      final p = Path()..moveTo(c[0].dx, c[0].dy);
      for (var i = 1; i <= run.floor() && i <= 4; i++) {
        p.lineTo(c[i % 4].dx, c[i % 4].dy);
      }
      final f = run - run.floor();
      if (f > 0 && run < 4) {
        final a = c[run.floor() % 4];
        final b = c[(run.floor() + 1) % 4];
        p.lineTo(a.dx + (b.dx - a.dx) * f, a.dy + (b.dy - a.dy) * f);
      }
      canvas.drawPath(p, trail);
    }
    final baseSize = size.width / 7;
    for (var i = 1; i <= 4; i++) {
      final on = run >= i;
      final o = c[i % 4];
      final base = Paint()..color = on ? color : DsColor.surface;
      canvas.save();
      canvas.translate(o.dx, o.dy);
      canvas.rotate(math.pi / 4);
      final rect = Rect.fromCenter(center: Offset.zero, width: baseSize, height: baseSize);
      canvas.drawRect(rect, base);
      canvas.drawRect(
        rect,
        Paint()
          ..color = on ? DsColor.onAction : DsColor.surfaceBorder
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.2,
      );
      canvas.restore();
    }
    if (runner != null && runner! < 4) {
      final a = c[runner!.floor() % 4];
      final b = c[(runner!.floor() + 1) % 4];
      final f = runner! - runner!.floor();
      canvas.drawCircle(Offset(a.dx + (b.dx - a.dx) * f, a.dy + (b.dy - a.dy) * f), size.width / 18, Paint()..color = DsColor.contentPrimary);
    }
  }

  @override
  bool shouldRepaint(_DiamondPainter old) => old.lit != lit || old.color != color || old.runner != runner;
}

// ───────────────────────── ホーム ─────────────────────────

class _Home extends StatefulWidget {
  const _Home();

  @override
  State<_Home> createState() => _HomeState();
}

class _HomeState extends State<_Home> {
  Future<void> _open(Widget w) async {
    await Navigator.of(context).push(dsRoute(w));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final p = profile;
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: StatsStreamBackground()),
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  children: [
                    const SizedBox(height: DsSpacing.space16),
                    Center(child: Text('プロ野球クイズ', style: DsTypography.caption.copyWith(color: DsColor.contentPrimary, letterSpacing: 2))),
                    const SizedBox(height: DsSpacing.space4),
                    const Center(child: Logo389(width: 190)),
                    const SizedBox(height: DsSpacing.space24),
                    GestureDetector(onTap: () => _open(const _Batting()), child: const _BattingCard()),
                    const SizedBox(height: DsSpacing.space16),
                    TodayCard(title: '今日の打席', onPlay: () => _open(_quiz(_daily())), note: p.dailyDone ? null : 'スリーアウトまで答えられる'),
                    const SizedBox(height: DsSpacing.space24),
                    DsButton(label: 'クイズ設定', type: DsButtonType.secondary, icon: Icons.tune_rounded, onPressed: () => showConditionSheet(context)),
                    const SizedBox(height: DsSpacing.space16),
                    DsButton(label: '打席に立つ！', icon: Icons.sports_baseball_rounded, onPressed: () => _open(_quiz(randomSession()))),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 打者としての今季の成績。打率を主役に、打席、安打、本塁打、長打率を添え、最近の打席をスコアブックの印で並べる。
class _BattingCard extends StatelessWidget {
  const _BattingCard();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final recent = p.records.take(10).toList().reversed.toList();
    return DsCard(
      accentColor: DsColor.actionPrimary,
      showDotGrid: true,
      hasShadow: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('あなたの打撃成績', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
              const Spacer(),
              const Icon(Icons.chevron_right_rounded, color: DsColor.contentSecondary),
            ],
          ),
          const SizedBox(height: DsSpacing.space8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              DsStat(label: '打率', value: p.average, size: 48, colors: averageColors(p.average), align: CrossAxisAlignment.start),
              const Spacer(),
              DsStat(label: '打席', value: '${p.plays}', size: 22),
              const SizedBox(width: DsSpacing.space16),
              DsStat(label: '本塁打', value: '${p.count(Rank.ss)}', size: 22, color: DsColor.rankSs),
              const SizedBox(width: DsSpacing.space16),
              DsStat(label: '長打率', value: _slg(_totalBases, p.plays), size: 22, color: DsColor.rankHighlight),
            ],
          ),
          const SizedBox(height: DsSpacing.space16),
          Text('最近の打席', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
          const SizedBox(height: DsSpacing.space4),
          Row(
            children: [
              for (var i = 0; i < 10; i++) ...[
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: i < recent.length
                        ? Container(
                            alignment: Alignment.center,
                            decoration: BoxDecoration(color: dsRankColor(recent[i].rank.label), borderRadius: DsRadius.borderXs, border: Border.all(color: DsColor.onAction)),
                            child: Text(_mark(recent[i].rank), style: DsTypography.caption.copyWith(color: DsColor.onAction, fontWeight: FontWeight.w700, height: 1)),
                          )
                        : Container(decoration: BoxDecoration(borderRadius: DsRadius.borderXs, border: Border.all(color: DsColor.disabledSurface))),
                  ),
                ),
                if (i < 9) const SizedBox(width: 4),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── 結果 ─────────────────────────

class _Result extends StatefulWidget {
  const _Result({required this.session});

  final QuizSession session;

  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> with SingleTickerProviderStateMixin {
  /// 走塁（0〜0.6）、打球の名の着地（0.55〜0.8）、成績の数字の更新（0.7〜1）を 1 本の時間で進める。
  late final _t = AnimationController(vsync: this, duration: Duration(milliseconds: 600 + 350 * _bases(widget.session.finalRank)));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (dsStill(context)) {
      _t.value = 1;
    } else if (_t.value == 0 && !_t.isAnimating) {
      Future<void>.delayed(const Duration(milliseconds: 200), () {
        if (mounted) _t.forward();
      });
    }
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final won = s.status == QuizStatus.correct;
    final r = s.finalRank;
    final color = dsRankColor(r.label);
    final p = profile;
    final ab0 = p.plays;
    final h0 = p.correct;
    final tb0 = _totalBases;
    final ab1 = ab0 + 1;
    final h1 = h0 + (won ? 1 : 0);
    final tb1 = tb0 + _bases(r);
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              DsPageHeader(
                title: s.mode == QuizMode.daily ? '今日の打席の結果' : '打席の結果',
                accentColor: color,
                leading: DsHeaderIconButton(icon: Icons.home_rounded, tooltip: 'TOP へ戻る', onPressed: () => Navigator.of(context).maybePop()),
                trailing: DsHeaderIconButton(icon: Icons.ios_share_rounded, tooltip: '結果をシェア', onPressed: () => showShareNote(context, '打席の結果')),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  children: [
                    AnimatedBuilder(
                      animation: _t,
                      builder: (context, _) {
                        final run = Curves.easeInOutCubic.transform((_t.value / 0.6).clamp(0, 1)) * _bases(r);
                        final land = Curves.easeOutBack.transform(((_t.value - 0.55) / 0.25).clamp(0, 1));
                        return DsCard(
                          accentColor: color,
                          showDotGrid: true,
                          hasShadow: true,
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            children: [
                              SizedBox(width: 120, height: 120, child: CustomPaint(painter: _DiamondPainter(lit: _bases(r), color: color, runner: run))),
                              const SizedBox(width: DsSpacing.space16),
                              Expanded(
                                child: Opacity(
                                  opacity: land.clamp(0, 1),
                                  child: Transform.scale(
                                    scale: 1.8 - 0.8 * land,
                                    alignment: Alignment.centerLeft,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        DsBadge(label: won ? 'ランク ${r.label}' : (s.status == QuizStatus.failed ? 'スリーアウト' : 'ギブアップ'), color: color),
                                        const SizedBox(height: DsSpacing.space8),
                                        FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('${_hit(r)}${won ? '！' : ''}', style: DsTypography.headline1.copyWith(color: color, fontSize: 36)),
                                        ),
                                        Text(won ? '${_bases(r)} 塁打' : '0 塁打', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: DsSpacing.space16),
                    ResultHeading(session: s, verdict: won ? '正解！' : null),
                    const SizedBox(height: DsSpacing.space16),
                    AnimatedBuilder(
                      animation: _t,
                      builder: (context, _) {
                        final u = Curves.easeOutCubic.transform(((_t.value - 0.7) / 0.3).clamp(0, 1));
                        String avg(double v) => rateText(v);
                        final a0 = ab0 == 0 ? 0.0 : h0 / ab0;
                        final a1 = h1 / ab1;
                        final s0 = ab0 == 0 ? 0.0 : tb0 / ab0;
                        final s1 = tb1 / ab1;
                        final avgNow = avg(a0 + (a1 - a0) * u);
                        final slgNow = s0 + (s1 - s0) * u;
                        return DsCard(
                          hasShadow: true,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _Delta(label: '打率', value: avgNow, up: a1 > a0, colors: averageColors(avgNow)),
                              _Delta(label: '長打率', value: slgNow >= 1 ? slgNow.toStringAsFixed(3) : rateText(slgNow), up: s1 > s0, color: DsColor.rankHighlight),
                              _Delta(label: '打席', value: '${u < 1 ? ab0 : ab1}', up: true),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: DsSpacing.space16),
                    StatsTable(session: s, compact: true),
                  ],
                ),
              ),
              DsBottomActionBar(
                child: Row(
                  children: [
                    Expanded(child: DsButton(label: 'TOPへ戻る', type: DsButtonType.outline, onPressed: () => Navigator.of(context).maybePop())),
                    const SizedBox(width: DsSpacing.space8),
                    Expanded(child: DsButton(label: '次の打席へ', icon: Icons.sports_baseball_rounded, onPressed: () => Navigator.of(context).pushReplacement(dsRoute(_quiz(randomSession()))))),
                  ],
                ),
              ),
            ],
          ),
          if (r == Rank.ss) const Positioned.fill(child: Confetti(burst: 90)),
        ],
      ),
    );
  }
}

class _Delta extends StatelessWidget {
  const _Delta({required this.label, required this.value, required this.up, this.color = DsColor.contentPrimary, this.colors});

  final String label;
  final String value;
  final bool up;
  final Color color;
  final List<Color>? colors;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
          const SizedBox(width: 2),
          Icon(up ? Icons.arrow_drop_up_rounded : Icons.arrow_drop_down_rounded, size: 16, color: up ? DsColor.statusSuccess : DsColor.incorrect),
        ],
      ),
      DsDisplayNumber(value, fontSize: 26, color: color, characterColors: colors),
    ],
  );
}

// ───────────────────────── 打撃成績（マイ成績） ─────────────────────────

class _Batting extends StatelessWidget {
  const _Batting();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    int n(Rank r) => p.count(r);
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(title: '打撃成績', leading: DsHeaderIconButton(icon: Icons.chevron_left_rounded, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop())),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                const _BattingCard(),
                const SizedBox(height: DsSpacing.space16),
                DsCard(
                  accentColor: DsColor.rankHighlight,
                  hasShadow: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('今季の成績', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                      const SizedBox(height: DsSpacing.space12),
                      _StatGrid(
                        cells: [
                          ('打席', '${p.plays}', DsColor.contentPrimary),
                          ('安打', '${p.correct}', DsColor.contentPrimary),
                          ('二塁打', '${n(Rank.a)}', DsColor.rankA),
                          ('三塁打', '${n(Rank.s)}', DsColor.rankS),
                          ('本塁打', '${n(Rank.ss)}', DsColor.rankSs),
                          ('塁打', '$_totalBases', DsColor.contentPrimary),
                          ('打率', p.average, DsColor.actionPrimary),
                          ('長打率', _slg(_totalBases, p.plays), DsColor.rankHighlight),
                        ],
                      ),
                      const SizedBox(height: DsSpacing.space16),
                      Text('打球の内訳', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                      const SizedBox(height: DsSpacing.space8),
                      for (final r in Rank.values)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              SizedBox(width: 64, child: Text(_hit(r), style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))),
                              Expanded(
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: FractionallySizedBox(
                                    widthFactor: p.plays == 0 ? 0.01 : math.max(0.01, n(r) / p.plays * 2.5).clamp(0, 1),
                                    child: Container(height: 12, decoration: BoxDecoration(color: dsRankColor(r.label), borderRadius: DsRadius.borderXs)),
                                  ),
                                ),
                              ),
                              SizedBox(width: 28, child: Text('${n(r)}', textAlign: TextAlign.right, style: DsTypography.displayNumeric.copyWith(fontSize: 14, color: DsColor.contentPrimary))),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: DsSpacing.space24),
                Text('打席の記録', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                const SizedBox(height: DsSpacing.space8),
                HistoryList(limit: 20, rankLabel: _hit),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatGrid extends StatelessWidget {
  const _StatGrid({required this.cells});

  final List<(String, String, Color)> cells;

  @override
  Widget build(BuildContext context) => GridView.count(
    crossAxisCount: 4,
    padding: EdgeInsets.zero,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: 12,
    childAspectRatio: 1.3,
    children: [for (final (l, v, c) in cells) DsStat(label: l, value: v, color: c, size: 22)],
  );
}
