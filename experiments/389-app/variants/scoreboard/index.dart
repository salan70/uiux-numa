import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/ds.dart';
import '../../shared/parts.dart';
import '../../shared/play.dart';
import '../../shared/profile.dart';
import '../../shared/quiz_screen.dart';

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
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  children: [
                    const SizedBox(height: DsSpacing.space24),
                    Center(child: Text('プロ野球クイズ', style: DsTypography.caption.copyWith(color: DsColor.contentPrimary, letterSpacing: 2))),
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
                                    Text('通算正解率', style: DsTypography.overline.copyWith(color: DsColor.onAction, letterSpacing: 0, fontWeight: FontWeight.w700)),
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
                    DsButton(label: 'クイズ設定', type: DsButtonType.secondary, icon: Icons.tune_rounded, onPressed: () => showConditionSheet(context)),
                    const SizedBox(height: DsSpacing.space16),
                    DsButton(label: 'クイズをプレイ！', icon: Icons.sports_baseball_rounded, onPressed: () => _open(_quiz(randomSession()))),
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

// ───────────────────────── 結果 ─────────────────────────

class _Result extends StatefulWidget {
  const _Result({required this.session});

  final QuizSession session;

  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> with SingleTickerProviderStateMixin {
  late final _land = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (dsStill(context)) {
      _land.value = 1;
    } else if (_land.value == 0 && !_land.isAnimating) {
      Future<void>.delayed(const Duration(milliseconds: 180), () {
        if (mounted) _land.forward();
      });
    }
  }

  @override
  void dispose() {
    _land.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final won = s.status == QuizStatus.correct;
    final rank = s.finalRank;
    final color = dsRankColor(rank.label);
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              DsPageHeader(
                title: s.mode == QuizMode.daily ? '今日の1問の結果' : '結果',
                accentColor: color,
                leading: DsHeaderIconButton(icon: Icons.home_rounded, tooltip: 'TOP へ戻る', onPressed: () => Navigator.of(context).maybePop()),
                trailing: DsHeaderIconButton(icon: Icons.ios_share_rounded, tooltip: '結果をシェア', onPressed: () => showShareNote(context, '結果のカード')),
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
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 120,
                            height: 104,
                            child: AnimatedBuilder(
                              animation: _land,
                              builder: (context, child) {
                                final v = Curves.easeOutBack.transform(_land.value);
                                return Opacity(opacity: _land.value.clamp(0, 1), child: Transform.scale(scale: 2.4 - 1.4 * v, child: child));
                              },
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('ランク', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                                  DsDisplayNumber(won ? rank.label : '×', fontSize: 72, color: color),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: DsSpacing.space12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _Line(label: '開示', value: '${s.unveil}/${s.total}', unit: '${(s.rate * 100).round()}%'),
                                const SizedBox(height: DsSpacing.space8),
                                _Line(label: '外れ', value: '${s.incorrect}', unit: '回'),
                                const SizedBox(height: DsSpacing.space12),
                                Text(won ? _next(s) : '同じ選手はまた出題されます', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary, height: 1.4)),
                              ],
                            ),
                          ),
                        ],
                      ),
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
                    Expanded(child: DsButton(label: 'もう一度！', icon: Icons.replay_rounded, onPressed: () => Navigator.of(context).pushReplacement(dsRoute(_quiz(randomSession()))))),
                  ],
                ),
              ),
            ],
          ),
          if (won) const Positioned.fill(child: Confetti()),
        ],
      ),
    );
  }
}

/// 次のランクへの手がかり。もう少しで上のランクだったなら、何マス少なければ届いたかを伝える。
String _next(QuizSession s) {
  final r = s.finalRank;
  if (r == Rank.ss) return 'これ以上ない当て方です';
  final up = Rank.values[math.max(0, r.index - 1)];
  final need = s.unveil - up.maxUnveil(s.total);
  if (s.incorrect > up.maxIncorrect) return '外れを ${up.maxIncorrect} 回以内にすると ${up.label}';
  return 'あと $need マス少なければ ${up.label}';
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
      SizedBox(width: 36, child: Text(label, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))),
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
          DsPageHeader(title: 'プレイ記録', leading: DsHeaderIconButton(icon: Icons.chevron_left_rounded, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop())),
          DsTabs(labels: const ['統計', '履歴'], index: _tab, onChanged: (i) => setState(() => _tab = i)),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: _tab == 1
                  ? [const HistoryList(limit: 30)]
                  : [
                      DsCard(
                        accentColor: DsColor.actionPrimary,
                        showDotGrid: true,
                        hasShadow: true,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text('サマリー', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
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
                                Text('コレクション', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
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
                              children: [
                                for (final t in teamOrder)
                                  DsSurface(
                                    borderColor: col[t]!.length == Profile.teamSize[t] && col[t]!.isNotEmpty ? DsColor.rankHighlight : DsColor.surfaceBorder,
                                    borderWidth: col[t]!.length == Profile.teamSize[t] && col[t]!.isNotEmpty ? DsBorder.standard : DsBorder.thin,
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(t, maxLines: 1, overflow: TextOverflow.ellipsis, style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                                        const SizedBox(height: 2),
                                        DsDisplayNumber('${col[t]!.length}', fontSize: 22, color: DsColor.actionPrimary),
                                      ],
                                    ),
                                  ),
                              ],
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
