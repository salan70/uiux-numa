import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/ds.dart';
import '../../shared/icons.dart';
import '../../shared/parts.dart';
import '../../shared/play.dart';
import '../../shared/profile.dart';
import '../../shared/quiz_screen.dart';
import '../../shared/remarks.dart';

// scoreboard: 現行の情報構造（ホーム → クイズ → 結果 → プレイ記録）と v2 の造形をそのまま保ち、体験の芯だけを磨く。
// 磨いた点は 3 つ。クイズの最中にいま当てたときのランクを出す。外れをダイアログでなく表の上の帯で知らせる。結果でランクを主役にする。
// 結果のランクは、紙吹雪とともに大きな文字が縮みながら着地し、ランクの色の隅のアクセントで結果のカードを塗り分ける。

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
  'stats': (_) => const _Record(),
};

QuizSession _wrong(QuizSession s) => s..guess(s.player.name == '山田 哲人' ? '坂本 勇人' : '山田 哲人');
QuizSession _won(QuizSession s) => s..guess(s.player.name);
QuizSession _failed(QuizSession s) {
  for (final n in ['山田 哲人', '近藤 健介', '浅村 栄斗']) {
    s.guess(n);
  }
  return s;
}

Widget _quiz(QuizSession s, {bool openAnswer = false}) => QuizScreen(
  session: s,
  openAnswer: openAnswer,
  onFinish: (s) => _Result(session: s),
  trailing: (s) => s.mode == QuizMode.daily ? LivesMark(left: s.livesLeft) : const SizedBox.shrink(),
  missExtra: (s) => s.mode == QuizMode.daily ? 'のこり ${s.livesLeft} 回' : null,
);

QuizSession _daily() => QuizSession(player: quizPlayers[profile.dailyNumber % quizPlayers.length], mode: QuizMode.daily, seed: profile.dailyNumber);

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
    final best = Rank.values.firstWhere((r) => p.count(r) > 0, orElse: () => Rank.miss);
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: StatsStreamBackground()),
          SafeArea(
            // 製品の Pattern A と同じく、中身を幅 360 に収めて縦の中央に置く。背が足りなければスクロールする。
            child: LayoutBuilder(
              builder: (context, box) => SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: box.maxHeight - 40),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 360),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Center(
                            child: Text('プロ野球クイズ', style: DsTypography.caption.copyWith(color: DsColor.contentPrimary, letterSpacing: 2)),
                          ),
                          const SizedBox(height: DsSpacing.space4),
                          const Center(child: Logo389(width: 230)),
                          const SizedBox(height: DsSpacing.space32),
                          TodayCard(onPlay: () => _open(_quiz(_daily()))),
                          const SizedBox(height: DsSpacing.space16),
                          GestureDetector(
                            onTap: () => _open(const _Record()),
                            child: DsCard(
                              accentColor: DsColor.actionPrimary,
                              hasShadow: true,
                              padding: EdgeInsets.zero,
                              child: IntrinsicHeight(
                                child: Row(
                                  children: [
                                    Container(
                                      width: 128,
                                      color: DsColor.contentPrimary,
                                      padding: const EdgeInsets.all(DsSpacing.space16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            '通算正解率',
                                            style: DsTypography.overline.copyWith(color: DsColor.onAction, letterSpacing: 0, fontWeight: FontWeight.w700),
                                          ),
                                          const SizedBox(height: DsSpacing.space4),
                                          DsDisplayNumber(p.average, fontSize: 36, color: DsColor.actionPrimary),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(vertical: DsSpacing.space16),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                          children: [
                                            DsStat(label: 'プレイ', value: '${p.plays}'),
                                            DsStat(label: '正解', value: '${p.correct}', color: DsColor.rankHighlight),
                                            DsStat(label: '最高ランク', value: best == Rank.miss ? '—' : best.label, color: dsRankColor(best.label)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: DsSpacing.space24),
                          DsButton(label: 'クイズ設定', type: DsButtonType.secondary, icon: DsGlyph.sliders, onPressed: () => showConditionSheet(context)),
                          const SizedBox(height: DsSpacing.space16),
                          DsButton(label: 'クイズをプレイ！', icon: DsGlyph.baseball, onPressed: () => _open(_quiz(randomSession()))),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
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
  /// 結果の入場。1 本の時間（900ms）を区切って使う。
  /// 120〜480ms でランクが 1.25 倍から着地し、着地の瞬間（360〜680ms）にランクの色の線が放射状に弾け、500〜720ms で一言が出る。
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));

  /// 撮影（bare=1）では一言を固定する。
  late final String _remark = pickRemark(widget.session, random: Uri.base.queryParameters['bare'] == '1' ? math.Random(1) : null);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (dsStill(context)) {
      _t.value = 1;
    } else if (_t.value == 0 && !_t.isAnimating) {
      _t.forward();
    }
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  Animation<double> _seg(double a, double b, [Curve curve = Curves.easeOut]) => CurvedAnimation(
    parent: _t,
    curve: Interval(a, b, curve: curve),
  );

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final won = s.status == QuizStatus.correct;
    final rank = s.finalRank;
    final color = dsRankColor(rank.label);
    final land = _seg(0.13, 0.53, Curves.easeOutBack);
    final burst = _seg(0.4, 0.75);
    final remark = _seg(0.55, 0.8);
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              DsPageHeader(
                title: s.mode == QuizMode.daily ? '今日の1問の結果' : '結果',
                accentColor: color,
                leading: DsHeaderIconButton(icon: DsGlyph.home, tooltip: 'TOP へ戻る', onPressed: () => Navigator.of(context).maybePop()),
                trailing: DsHeaderIconButton(icon: DsGlyph.share, tooltip: '結果をシェア', onPressed: () => showShareNote(context, '結果のカード')),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                  children: [
                    ResultHeading(session: s),
                    const SizedBox(height: DsSpacing.space20),
                    DsCard(
                      accentColor: color,
                      showDotGrid: true,
                      hasShadow: true,
                      padding: const EdgeInsets.fromLTRB(16, 16, 20, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: 128,
                                height: 104,
                                child: AnimatedBuilder(
                                  animation: _t,
                                  builder: (context, _) => CustomPaint(
                                    painter: won ? _BurstPainter(progress: burst.value, color: color) : null,
                                    child: Opacity(
                                      opacity: (_t.value / 0.2).clamp(0, 1),
                                      child: Transform.scale(
                                        scale: 1.25 - 0.25 * land.value,
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Text('ランク', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                                            Text(
                                              won ? rank.label : '×',
                                              style: DsTypography.displayNumeric.copyWith(
                                                fontSize: 72,
                                                color: color,
                                                shadows: [Shadow(color: DsColor.shadow, offset: Offset(0, 4 * land.value.clamp(0, 1)))],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: DsSpacing.space8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _Line(label: '開示', value: '${s.unveil}/${s.total}', unit: '${(s.rate * 100).round()}%'),
                                    const SizedBox(height: DsSpacing.space8),
                                    _Line(label: '外れ', value: '${s.incorrect}', unit: '回'),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const Divider(color: DsColor.disabledSurface, height: 24),
                          FadeTransition(
                            opacity: remark,
                            child: SlideTransition(
                              position: Tween(begin: const Offset(0, 0.3), end: Offset.zero).animate(remark),
                              child: Text(_remark, style: DsTypography.body1.copyWith(color: DsColor.contentPrimary)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: DsSpacing.space16),
                    StatsTable(session: s, compact: true, mono: true),
                  ],
                ),
              ),
              DsBottomActionBar(
                child: Row(
                  children: [
                    Expanded(
                      child: DsButton(label: 'TOPへ戻る', type: DsButtonType.outline, onPressed: () => Navigator.of(context).maybePop()),
                    ),
                    const SizedBox(width: DsSpacing.space8),
                    Expanded(
                      child: DsButton(label: 'もう一度！', icon: DsGlyph.replay, onPressed: () => Navigator.of(context).pushReplacement(dsRoute(_quiz(randomSession())))),
                    ),
                  ],
                ),
              ),
            ],
          ),
          // 紙吹雪は正解のたびに降らせ、量を少ない手がかりで当てたほど多くする（round 5、利用者の所見）。
          if (won)
            Positioned.fill(
              child: Confetti(
                burst: switch (rank) {
                  Rank.ss => 120,
                  Rank.s => 90,
                  Rank.a => 60,
                  Rank.b => 45,
                  _ => 30,
                },
              ),
            ),
        ],
      ),
    );
  }
}

/// ランクが着地した瞬間の、放射状の短い線。v2 の装飾（幾何の小さな形、単色）に合わせ、ぼかしを使わない。
class _BurstPainter extends CustomPainter {
  const _BurstPainter({required this.progress, required this.color});

  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final c = size.center(const Offset(0, 8));
    final paint = Paint()
      ..color = color.withValues(alpha: 1 - progress)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    const n = 12;
    for (var i = 0; i < n; i++) {
      final a = i * 2 * math.pi / n + math.pi / n;
      final d = Offset(math.cos(a), math.sin(a));
      final r0 = 40 + 22 * progress;
      final r1 = r0 + 10 * (1 - progress) + 4;
      canvas.drawLine(c + d * r0, c + d * r1, paint);
    }
  }

  @override
  bool shouldRepaint(_BurstPainter old) => old.progress != progress || old.color != color;
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value, required this.unit});

  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.end,
    children: [
      SizedBox(
        width: 36,
        child: Text(label, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
      ),
      DsDisplayNumber(value, fontSize: 24),
      const SizedBox(width: 6),
      Text(unit, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
    ],
  );
}

// ───────────────────────── プレイ記録 ─────────────────────────

class _Record extends StatefulWidget {
  const _Record();

  @override
  State<_Record> createState() => _RecordState();
}

class _RecordState extends State<_Record> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final col = p.collection;
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(
            title: 'プレイ記録',
            leading: DsHeaderIconButton(icon: DsGlyph.chevronLeft, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop()),
          ),
          DsTabs(labels: const ['統計', 'ノーマル', '今日の1問'], index: _tab, onChanged: (i) => setState(() => _tab = i)),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: _tab == 1
                  ? [HistoryList(onOpen: (r) => Navigator.of(context).push(dsRoute(_RecordDetail(record: r))))]
                  : _tab == 2
                  ? [_DailyLog(onChanged: () => setState(() {}))]
                  : [
                      DsCard(
                        accentColor: DsColor.actionPrimary,
                        showDotGrid: true,
                        hasShadow: true,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'サマリー',
                              style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: DsSpacing.space12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                DsStat(label: '正解率', value: p.average, size: 36, colors: averageColors(p.average), align: CrossAxisAlignment.start),
                                DsStat(label: '総プレイ', value: '${p.plays}'),
                                DsStat(label: '正解', value: '${p.correct}', color: DsColor.rankHighlight),
                                DsStat(label: 'SS', value: '${p.count(Rank.ss)}', color: DsColor.rankSs),
                              ],
                            ),
                            const SizedBox(height: DsSpacing.space16),
                            const RankBar(),
                          ],
                        ),
                      ),
                      const SizedBox(height: DsSpacing.space16),
                      const TodayCard(onPlay: null),
                      const SizedBox(height: DsSpacing.space16),
                      DsCard(
                        accentColor: DsColor.rankHighlight,
                        hasShadow: true,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'コレクション',
                                  style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                                ),
                                const Spacer(),
                                Text('正解 ${col.values.fold(0, (a, s) => a + s.length)} 人', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                              ],
                            ),
                            const SizedBox(height: DsSpacing.space12),
                            GridView.count(
                              crossAxisCount: 4,
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              mainAxisSpacing: 8,
                              crossAxisSpacing: 8,
                              childAspectRatio: 1.15,
                              children: [for (final t in teamOrder) _TeamTile(team: t, count: col[t]!.length, size: Profile.teamSize[t]!)],
                            ),
                          ],
                        ),
                      ),
                    ],
            ),
          ),
        ],
      ),
    );
  }
}

/// コレクションの 1 球団。正解した人数を主に、出題できる人数を添える。全員を当てた球団は黄の枠と王冠にする。
class _TeamTile extends StatelessWidget {
  const _TeamTile({required this.team, required this.count, required this.size});

  final String team;
  final int count;
  final int size;

  @override
  Widget build(BuildContext context) {
    final complete = size > 0 && count == size;
    return DsSurface(
      backgroundColor: DsColor.background,
      borderColor: complete ? DsColor.rankHighlight : DsColor.disabledSurface,
      borderWidth: complete ? DsBorder.standard : DsBorder.thin,
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(team, maxLines: 1, style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                ),
              ),
              if (complete) const DsIcon(DsGlyph.crown, size: 12, color: DsColor.rankHighlight),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              DsDisplayNumber('$count', fontSize: 22, color: count == 0 ? DsColor.disabledContent : DsColor.actionPrimary),
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: DsDisplayNumber('/$size', fontSize: 12, color: DsColor.contentSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 今日の1問の記録。日付の新しい順に並べ、遊んだ日はランク、遊ばなかった日は「未プレイ」を出す。
/// 遊んだ日を押すとその日の結果を、遊ばなかった日を押すとその日の問題を開く（製品と同じく記録はしない）。
class _DailyLog extends StatelessWidget {
  const _DailyLog({required this.onChanged});

  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final days = profile.dailyLog();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final d in days)
          Padding(
            padding: const EdgeInsets.only(bottom: DsSpacing.space8),
            child: RecordRow(
              title: '今日の1問 No.${d.number}',
              date: dayLabel(d.day),
              detail: d.record == null ? (d.day == 0 ? '19:00 まで' : '記録なし') : (d.record!.correct ? '開示 ${d.record!.unveilPercent}%' : '不正解'),
              rank: d.record?.rank,
              onTap: () async {
                if (d.record != null) {
                  await Navigator.of(context).push(dsRoute(_RecordDetail(record: d.record!)));
                } else if (d.day == 0) {
                  await Navigator.of(context).push(dsRoute(_quiz(_daily())));
                } else {
                  final s = QuizSession(player: d.player, seed: d.number);
                  await Navigator.of(context).push(
                    dsRoute(
                      QuizScreen(
                        session: s,
                        title: '今日の1問 No.${d.number}',
                        onFinish: (s) => _Result(session: s),
                      ),
                    ),
                  );
                }
                onChanged();
              },
            ),
          ),
        Text('過去の問題は、解いても記録に残りません。', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
      ],
    );
  }
}

/// 過去の 1 回の結果。結果の画面と同じ並びで、動きと操作の帯を持たない。
class _RecordDetail extends StatelessWidget {
  const _RecordDetail({required this.record});

  final PlayRecord record;

  @override
  Widget build(BuildContext context) {
    final r = record;
    final s = QuizSession(player: r.player, seed: r.dailyNumber ?? r.player.id.hashCode);
    for (var i = 0; i < (s.total * r.unveilPercent / 100).round(); i++) {
      s.revealNext();
    }
    if (r.correct) {
      s.guess(r.player.name);
    } else {
      s.giveUp();
    }
    final color = dsRankColor(r.rank.label);
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(
            title: r.daily ? '今日の1問 No.${r.dailyNumber}' : 'ノーマルの記録',
            accentColor: color,
            leading: DsHeaderIconButton(icon: DsGlyph.chevronLeft, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop()),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              children: [
                Text(
                  dayLabel(r.day),
                  textAlign: TextAlign.center,
                  style: DsTypography.caption.copyWith(color: DsColor.contentSecondary),
                ),
                const SizedBox(height: DsSpacing.space8),
                ResultHeading(session: s, verdict: r.correct ? '正解' : '不正解'),
                const SizedBox(height: DsSpacing.space20),
                DsCard(
                  accentColor: color,
                  showDotGrid: true,
                  hasShadow: true,
                  child: Row(
                    children: [
                      SizedBox(
                        width: 112,
                        child: Column(
                          children: [
                            Text('ランク', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                            DsDisplayNumber(r.correct ? r.rank.label : '×', fontSize: 56, color: color),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [_Line(label: '開示', value: '${s.unveil}/${s.total}', unit: '${r.unveilPercent}%')],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: DsSpacing.space16),
                StatsTable(session: s, compact: true, mono: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
