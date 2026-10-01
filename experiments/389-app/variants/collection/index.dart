import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/ds.dart';
import '../../shared/parts.dart';
import '../../shared/play.dart';
import '../../shared/quiz_screen.dart';
import '../../shared/switcher.dart';

// collection: 製品のマイ成績の「正解コレクション」（球団別に正解した選手を集める）を、ホームと結果の主役に上げる。
// 1 問の価値を「正解率が上がる」だけでなく「名鑑の空きが 1 つ埋まる」にし、長く遊ぶ動機を球団のコンプリートに置く。
// 結果では、当てた選手のカードが出て、ホームと同じ球団の列の空きへ飛んで収まる。初めての選手は NEW、ランクが上がれば更新を出す。
// 造形は v2 のまま、カードの隅のアクセントをランクの色にして、集めた選手の当て方を残す。

Widget buildVariant() => const VariantHost(initial: 'collection');

/// この案の殻。VariantHost が案を替えるときに作り直す。
Widget buildApp() => QuizApp(title: '.389', theme: buildDsTheme(), screens: _screens, variant: 'collection');

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
  'stats': (_) => const _Book(),
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

/// 選手ごとの最高のランク。集めていなければ載らない。
Map<String, Rank> get _best {
  final map = <String, Rank>{};
  for (final r in profile.records.where((e) => e.correct)) {
    final prev = map[r.player.name];
    if (prev == null || r.rank.index < prev.index) map[r.player.name] = r.rank;
  }
  return map;
}

int get _collected => _best.length;

int _career(QuizPlayer p, String stat) {
  final i = statColumns.indexOf(stat) + 1;
  return p.rows.where((r) => r[0] != '通算').fold(0, (sum, r) => sum + (int.tryParse(r[i]) ?? 0));
}

/// 球団の列。選手の数だけ升を並べ、集めた升をランクの色で塗る。
class _TeamPips extends StatelessWidget {
  const _TeamPips({required this.team, this.highlight, this.pipKey, this.fill = 1});

  final String team;

  /// 結果で収める選手。この升だけ fill の割合で塗る。
  final String? highlight;
  final GlobalKey? pipKey;
  final double fill;

  @override
  Widget build(BuildContext context) {
    final best = _best;
    final players = quizPlayers.where((p) => teamShort[p.team] == team).toList();
    return Row(
      children: [
        for (final p in players) ...[
          Builder(
            builder: (context) {
              final isTarget = p.name == highlight;
              final r = best[p.name];
              final on = r != null && !(isTarget && fill < 1);
              final color = on ? dsRankColor(r.label) : (isTarget ? DsColor.actionPrimary : DsColor.background);
              return Container(
                key: isTarget ? pipKey : null,
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: isTarget && !on ? Color.lerp(DsColor.background, color, fill) : color,
                  borderRadius: BorderRadius.circular(3),
                  border: Border.all(color: on || isTarget ? DsColor.onAction : DsColor.disabledSurface),
                ),
              );
            },
          ),
          const SizedBox(width: 3),
        ],
      ],
    );
  }
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
    final total = quizPlayers.length;
    final complete = teamOrder.where((t) => quizPlayers.where((p) => teamShort[p.team] == t).every((p) => _best.containsKey(p.name))).length;
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
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Logo389(width: 120),
                        const SizedBox(width: DsSpacing.space8),
                        Padding(padding: const EdgeInsets.only(bottom: 6), child: Text('プロ野球クイズ', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))),
                        const Spacer(),
                        DsStat(label: '正解率', value: profile.average, size: 22, colors: averageColors(profile.average), align: CrossAxisAlignment.end),
                      ],
                    ),
                    const SizedBox(height: DsSpacing.space20),
                    GestureDetector(
                      onTap: () => _open(const _Book()),
                      child: DsCard(
                        accentColor: DsColor.rankHighlight,
                        showDotGrid: true,
                        hasShadow: true,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('選手名鑑', style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                                    Text('当てた選手が載る', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                                  ],
                                ),
                                const Spacer(),
                                DsDisplayNumber('$_collected', fontSize: 40, color: DsColor.rankHighlight),
                                Padding(padding: const EdgeInsets.only(bottom: 4), child: DsDisplayNumber(' / $total', fontSize: 18, color: DsColor.contentSecondary)),
                              ],
                            ),
                            const SizedBox(height: DsSpacing.space8),
                            ClipRRect(
                              borderRadius: DsRadius.borderXs,
                              child: LinearProgressIndicator(value: _collected / total, minHeight: 8, color: DsColor.rankHighlight, backgroundColor: DsColor.background),
                            ),
                            const SizedBox(height: DsSpacing.space16),
                            for (final t in teamOrder)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Row(
                                  children: [
                                    SizedBox(width: 80, child: Text(t, style: DsTypography.caption.copyWith(color: DsColor.contentPrimary))),
                                    Expanded(child: _TeamPips(team: t)),
                                    if (quizPlayers.where((p) => teamShort[p.team] == t).every((p) => _best.containsKey(p.name))) const Icon(Icons.workspace_premium_rounded, size: 16, color: DsColor.rankHighlight),
                                  ],
                                ),
                              ),
                            const SizedBox(height: DsSpacing.space4),
                            Text('コンプリート $complete / 12 球団', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: DsSpacing.space16),
                    TodayCard(onPlay: () => _open(_quiz(_daily()))),
                    const SizedBox(height: DsSpacing.space24),
                    DsButton(label: 'クイズ設定', type: DsButtonType.secondary, icon: Icons.tune_rounded, onPressed: () => showConditionSheet(context)),
                    const SizedBox(height: DsSpacing.space16),
                    DsButton(label: '選手を当てに行く！', icon: Icons.sports_baseball_rounded, onPressed: () => _open(_quiz(randomSession()))),
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

/// 当てた選手のカード。隅のアクセントをランクの色にし、通算の本塁打と安打を添える。
class _PlayerCard extends StatelessWidget {
  const _PlayerCard({required this.player, required this.rank, this.isNew = false, this.upgraded});

  final QuizPlayer player;
  final Rank rank;
  final bool isNew;
  final Rank? upgraded;

  @override
  Widget build(BuildContext context) {
    final color = dsRankColor(rank.label);
    return DsSurface(
      backgroundColor: DsColor.surface,
      borderColor: color,
      borderWidth: DsBorder.standard,
      borderRadius: DsRadius.borderMd,
      shadow: DsShadow.large,
      dotGrid: true,
      accentColor: color,
      accentSize: 40,
      padding: const EdgeInsets.all(DsSpacing.space16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              DsBadge(label: teamShort[player.team] ?? player.team, color: DsColor.contentPrimary),
              const Spacer(),
              if (isNew) const DsBadge(label: 'NEW', color: DsColor.actionEmphasis, shape: DsBadgeShape.chamfered),
              if (upgraded != null) DsBadge(label: '${upgraded!.label} → ${rank.label}', color: DsColor.statusSuccess, shape: DsBadgeShape.chamfered),
            ],
          ),
          const SizedBox(height: DsSpacing.space16),
          Text(player.name, style: DsTypography.headline1.copyWith(color: DsColor.contentPrimary, fontSize: 30)),
          const SizedBox(height: DsSpacing.space12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              DsStat(label: '通算本塁打', value: '${_career(player, '本塁打')}', size: 24, align: CrossAxisAlignment.start),
              const SizedBox(width: DsSpacing.space20),
              DsStat(label: '通算安打', value: '${_career(player, '安打')}', size: 24, align: CrossAxisAlignment.start),
              const Spacer(),
              DsDisplayNumber(rank.label, fontSize: 48, color: color),
            ],
          ),
        ],
      ),
    );
  }
}

class _Result extends StatefulWidget {
  const _Result({required this.session});

  final QuizSession session;

  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> with SingleTickerProviderStateMixin {
  /// カードの登場（0〜0.3）、待ち（〜0.5）、升へ飛ぶ（0.5〜0.8）、升が灯る（0.8〜1）。
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 2200));
  final _stackKey = GlobalKey();
  final _cardKey = GlobalKey();
  final _pipKey = GlobalKey();
  Offset? _from;
  Offset? _to;
  late final bool _won = widget.session.status == QuizStatus.correct;
  late final Rank? _before = _best[widget.session.player.name];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _measure());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (dsStill(context) || !_won) {
      _t.value = 1;
    } else if (_t.value == 0 && !_t.isAnimating) {
      _t.forward();
    }
  }

  /// カードのランクの文字と升の中心を測り、札が飛ぶ始点と終点にする。
  void _measure() {
    final stack = _stackKey.currentContext?.findRenderObject() as RenderBox?;
    final card = _cardKey.currentContext?.findRenderObject() as RenderBox?;
    final pip = _pipKey.currentContext?.findRenderObject() as RenderBox?;
    if (stack == null || card == null || pip == null) return;
    setState(() {
      _from = card.localToGlobal(Offset(card.size.width - 48, card.size.height - 40), ancestor: stack);
      _to = pip.localToGlobal(pip.size.center(Offset.zero), ancestor: stack);
    });
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final team = teamShort[s.player.team] ?? s.player.team;
    final rank = s.finalRank;
    final isNew = _won && _before == null;
    final upgraded = _won && _before != null && rank.index < _before.index ? _before : null;
    final teamPlayers = quizPlayers.where((p) => teamShort[p.team] == team).toList();
    final had = teamPlayers.where((p) => _best.containsKey(p.name)).length;
    final after = had + (isNew ? 1 : 0);
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              DsPageHeader(
                title: s.mode == QuizMode.daily ? '今日の1問の結果' : '結果',
                accentColor: dsRankColor(rank.label),
                leading: DsHeaderIconButton(icon: Icons.home_rounded, tooltip: 'TOP へ戻る', onPressed: () => Navigator.of(context).maybePop()),
                trailing: DsHeaderIconButton(icon: Icons.ios_share_rounded, tooltip: '結果をシェア', onPressed: () => showShareNote(context, '選手のカード')),
              ),
              Expanded(
                child: Stack(
                  key: _stackKey,
                  clipBehavior: Clip.none,
                  children: [
                    ListView(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                      children: [
                        ResultHeading(session: s),
                        const SizedBox(height: DsSpacing.space20),
                        AnimatedBuilder(
                          animation: _t,
                          builder: (context, child) {
                            final appear = Curves.easeOutBack.transform((_t.value / 0.3).clamp(0, 1));
                            if (!_won) return Opacity(opacity: 0.5, child: ColorFiltered(colorFilter: const ColorFilter.mode(DsColor.disabledSurface, BlendMode.saturation), child: child));
                            return Transform.scale(scale: 0.6 + 0.4 * appear, child: Opacity(opacity: appear.clamp(0, 1), child: child));
                          },
                          child: KeyedSubtree(
                            key: _cardKey,
                            child: _PlayerCard(player: s.player, rank: _won ? rank : Rank.c, isNew: isNew, upgraded: upgraded),
                          ),
                        ),
                        const SizedBox(height: DsSpacing.space16),
                        AnimatedBuilder(
                          animation: _t,
                          builder: (context, _) {
                            final lit = Curves.easeOut.transform(((_t.value - 0.8) / 0.2).clamp(0, 1));
                            return DsCard(
                              accentColor: DsColor.rankHighlight,
                              hasShadow: true,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(team, style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                                      const Spacer(),
                                      DsDisplayNumber('${lit > 0.5 ? after : had}', fontSize: 24, color: DsColor.rankHighlight),
                                      DsDisplayNumber(' / ${teamPlayers.length}', fontSize: 16, color: DsColor.contentSecondary),
                                    ],
                                  ),
                                  const SizedBox(height: DsSpacing.space8),
                                  _TeamPips(team: team, highlight: _won ? s.player.name : null, pipKey: _pipKey, fill: lit),
                                  const SizedBox(height: DsSpacing.space8),
                                  Text(
                                    !_won
                                        ? '当てると $team の名鑑に載ります'
                                        : (after == teamPlayers.length ? '$team をコンプリート！' : 'コンプリートまで あと ${teamPlayers.length - after} 人'),
                                    style: DsTypography.caption.copyWith(color: after == teamPlayers.length && _won ? DsColor.rankHighlight : DsColor.contentSecondary),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: DsSpacing.space16),
                        Row(
                          children: [
                            Expanded(child: DsCard(child: DsStat(label: '開示', value: '${(s.rate * 100).round()}%'))),
                            const SizedBox(width: DsSpacing.space8),
                            Expanded(child: DsCard(child: DsStat(label: '外れ', value: '${s.incorrect}'))),
                            const SizedBox(width: DsSpacing.space8),
                            Expanded(child: DsCard(child: DsStat(label: 'ランク', value: _won ? rank.label : '×', color: dsRankColor(rank.label)))),
                          ],
                        ),
                        const SizedBox(height: DsSpacing.space16),
                        StatsTable(session: s, compact: true),
                      ],
                    ),
                    // カードのランクから升へ、ランクの色の札が飛ぶ。
                    if (_won && _from != null && _to != null)
                      AnimatedBuilder(
                        animation: _t,
                        builder: (context, _) {
                          final v = _t.value;
                          if (v < 0.5 || v >= 0.8) return const SizedBox.shrink();
                          final f = Curves.easeInOutCubic.transform((v - 0.5) / 0.3);
                          final arc = -80 * (1 - (2 * f - 1) * (2 * f - 1));
                          final size = 40 - 26 * f;
                          final at = Offset.lerp(_from, _to, f)! + Offset(0, arc);
                          return Positioned(
                            left: at.dx - size / 2,
                            top: at.dy - size / 2,
                            child: IgnorePointer(
                              child: Transform.rotate(
                                angle: f * 3.14,
                                child: Container(
                                  width: size,
                                  height: size,
                                  decoration: BoxDecoration(color: dsRankColor(rank.label), borderRadius: BorderRadius.circular(4), border: Border.all(color: DsColor.onAction, width: 1.5), boxShadow: DsShadow.xs),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
              DsBottomActionBar(
                child: Row(
                  children: [
                    Expanded(child: DsButton(label: '名鑑を見る', type: DsButtonType.outline, onPressed: () => Navigator.of(context).pushReplacement(dsRoute(const _Book())))),
                    const SizedBox(width: DsSpacing.space8),
                    Expanded(child: DsButton(label: '次の選手へ', icon: Icons.sports_baseball_rounded, onPressed: () => Navigator.of(context).pushReplacement(dsRoute(_quiz(randomSession()))))),
                  ],
                ),
              ),
            ],
          ),
          if (_won && (isNew || after == teamPlayers.length)) const Positioned.fill(child: Confetti()),
        ],
      ),
    );
  }
}

// ───────────────────────── 選手名鑑（マイ成績） ─────────────────────────

class _Book extends StatelessWidget {
  const _Book();

  @override
  Widget build(BuildContext context) {
    final best = _best;
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(title: '選手名鑑', leading: DsHeaderIconButton(icon: Icons.chevron_left_rounded, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop())),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                DsCard(
                  accentColor: DsColor.actionPrimary,
                  showDotGrid: true,
                  hasShadow: true,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      DsStat(label: '収集', value: '$_collected/${quizPlayers.length}', color: DsColor.rankHighlight),
                      DsStat(label: '正解率', value: profile.average, colors: averageColors(profile.average)),
                      DsStat(label: 'SS で収集', value: '${best.values.where((r) => r == Rank.ss).length}', color: DsColor.rankSs),
                    ],
                  ),
                ),
                const SizedBox(height: DsSpacing.space12),
                const RankBar(),
                for (final t in teamOrder) ...[
                  const SizedBox(height: DsSpacing.space24),
                  Row(
                    children: [
                      Text(t, style: DsTypography.headline4.copyWith(color: DsColor.contentPrimary)),
                      const SizedBox(width: DsSpacing.space8),
                      Text(
                        '${quizPlayers.where((p) => teamShort[p.team] == t && best.containsKey(p.name)).length} / ${quizPlayers.where((p) => teamShort[p.team] == t).length}',
                        style: DsTypography.displayNumeric.copyWith(fontSize: 16, color: DsColor.contentSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: DsSpacing.space8),
                  GridView.count(
                    crossAxisCount: 3,
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: 1.25,
                    children: [
                      for (final p in quizPlayers.where((e) => teamShort[e.team] == t))
                        best[p.name] == null
                            ? DsSurface(
                                backgroundColor: DsColor.background,
                                borderColor: DsColor.disabledSurface,
                                child: Center(child: Text('？？？', style: DsTypography.body2.copyWith(color: DsColor.disabledContent))),
                              )
                            : DsSurface(
                                accentColor: dsRankColor(best[p.name]!.label),
                                accentSize: 16,
                                shadow: DsShadow.xs,
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    DsDisplayNumber(best[p.name]!.label, fontSize: 18, color: dsRankColor(best[p.name]!.label)),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(p.name, style: DsTypography.body2.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                                    ),
                                  ],
                                ),
                              ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
