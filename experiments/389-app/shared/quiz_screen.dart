import 'package:flutter/material.dart';

import 'app.dart';
import 'data.dart';
import 'ds.dart';
import 'play.dart';

// 3 案が共有するクイズの画面。v2 の Pattern C に従い、上にヘッダー、中に成績表、下に「補助｜回答｜補助」の帯を置く。
// 案ごとに変えるのは、目盛りの読み替え、ヘッダーの右、表の上の札、終わった後の行き先である。

class QuizScreen extends StatefulWidget {
  const QuizScreen({
    required this.session,
    required this.onFinish,
    super.key,
    this.openAnswer = false,
    this.meterLabels,
    this.trailing,
    this.above,
    this.missExtra,
  });

  final QuizSession session;

  /// 正解、3 回外れ、あきらめの後に開く画面。今の画面と置き換える。
  final Widget Function(QuizSession) onFinish;
  final bool openAnswer;
  final String Function(Rank)? meterLabels;

  /// ヘッダーの右（今日の1問の残りなど）。
  final Widget Function(QuizSession)? trailing;

  /// 目盛りの上に置く札。
  final Widget Function(QuizSession)? above;

  /// 外れの帯に添える一言。
  final String? Function(QuizSession)? missExtra;

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  QuizSession get s => widget.session;
  int _misses = 0;

  @override
  void initState() {
    super.initState();
    s.addListener(_changed);
    if (widget.openAnswer) WidgetsBinding.instance.addPostFrameCallback((_) => _answer());
  }

  @override
  void dispose() {
    s.removeListener(_changed);
    super.dispose();
  }

  void _changed() => setState(() {});

  void _finish() => Navigator.of(context).pushReplacement(dsRoute(widget.onFinish(s)));

  Future<void> _answer() async {
    final name = await showAnswerSheet(context, wrong: s.wrongNames);
    if (name == null || !mounted) return;
    final outcome = s.guess(name);
    if (outcome == GuessOutcome.wrong) {
      setState(() => _misses++);
      return;
    }
    _finish();
  }

  Future<void> _menu({bool revealOnly = false}) async {
    final choice = await showQuizMenu(context, canRevealAll: s.mode == QuizMode.normal && s.unveil < s.total, canGiveUp: !revealOnly);
    if (!mounted) return;
    if (choice == 'all') s.revealAll();
    if (choice == 'give') {
      s.giveUp();
      _finish();
    }
  }

  @override
  Widget build(BuildContext context) {
    final daily = s.mode == QuizMode.daily;
    final full = s.unveil >= s.total;
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(
            title: daily ? '今日の1問 No.${profile.dailyNumber}' : 'マニュアルモード',
            accentColor: daily ? DsColor.actionEmphasis : DsColor.rankHighlight,
            leading: DsHeaderIconButton(icon: Icons.logout_rounded, tooltip: 'あきらめる、すべて表示', onPressed: _menu),
            trailing: widget.trailing?.call(s),
          ),
          Expanded(
            child: Stack(
              children: [
                ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
                  children: [
                    ?widget.above?.call(s),
                    RankMeter(session: s, labels: widget.meterLabels),
                    if (s.wrongNames.isNotEmpty) ...[
                      const SizedBox(height: DsSpacing.space8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [for (final n in s.wrongNames) DsBadge(label: '× $n', color: DsColor.surface, foreground: DsColor.incorrect)],
                      ),
                    ],
                    const SizedBox(height: DsSpacing.space12),
                    StatsTable(session: s),
                  ],
                ),
                Positioned(
                  top: 12,
                  left: 20,
                  right: 20,
                  child: Center(child: MissBanner(name: s.wrongNames.lastOrNull, trigger: _misses, extra: widget.missExtra?.call(s))),
                ),
              ],
            ),
          ),
          DsBottomActionBar(
            child: Row(
              children: [
                Expanded(
                  flex: 3,
                  child: daily
                      ? DsButton(label: 'あきらめる', type: DsButtonType.outline, small: true, onPressed: _menu)
                      : DsButton(label: 'すべて表示', type: DsButtonType.outline, small: true, onPressed: full ? null : () => _menu(revealOnly: true)),
                ),
                const SizedBox(width: DsSpacing.space8),
                Expanded(flex: 5, child: DsButton(label: '回答する', icon: Icons.sports_baseball_rounded, onPressed: _answer)),
                const SizedBox(width: DsSpacing.space8),
                Expanded(flex: 3, child: DsButton(label: '次を表示', type: DsButtonType.outline, small: true, onPressed: full ? null : s.revealNext)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 今日の1問の残り回数。野球ボールの印を 3 つ並べ、外すごとに消す。
class LivesMark extends StatelessWidget {
  const LivesMark({required this.left, super.key});

  final int left;

  @override
  Widget build(BuildContext context) => Semantics(
    label: '残り $left 回',
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < QuizSession.dailyLives; i++)
          Padding(
            padding: const EdgeInsets.only(left: 2),
            child: Icon(Icons.sports_baseball_rounded, size: 20, color: i < left ? DsColor.contentPrimary : DsColor.disabledSurface),
          ),
      ],
    ),
  );
}
