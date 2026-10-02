import 'package:flutter/material.dart';

import 'app.dart';
import 'celebration.dart';
import 'data.dart';
import 'ds.dart';
import 'icons.dart';
import 'play.dart';

// 3 案が共有するクイズの画面。v2 の Pattern C に従い、上にヘッダー、中に成績表、下に「補助｜回答｜補助」の帯を置く。
// 案ごとに変えるのは、目盛りの読み替え、ヘッダーの右、表の上の札、終わった後の行き先である。

class QuizScreen extends StatefulWidget {
  const QuizScreen({required this.session, required this.onFinish, super.key, this.openAnswer = false, this.meterLabels, this.trailing, this.above, this.missExtra, this.title});

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

  /// ヘッダーの題の上書き（過去の今日の1問など）。
  final String? title;

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  QuizSession get s => widget.session;
  int _misses = 0;

  /// 正解した後の答え合わせの間。残りのマスが波で開き、正解の札が出る。
  bool _won = false;
  bool _leaving = false;

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

  void _finish() {
    if (_leaving || !mounted) return;
    _leaving = true;
    Navigator.of(context).pushReplacement(dsRoute(widget.onFinish(s)));
  }

  Future<void> _answer() async {
    final name = await showAnswerSheet(context, wrong: s.wrongNames);
    if (name == null || !mounted) return;
    // 正解なら、シートが閉じきってから演出を始め、その後で判定する。判定が先だと、表の残りのマスが波を待たずに一度に開くため。
    if (name == s.player.name && !s.isOver) {
      await Future<void>.delayed(const Duration(milliseconds: 220));
      if (!mounted) return;
      setState(() => _won = true);
    }
    final outcome = s.guess(name);
    if (outcome == GuessOutcome.wrong) {
      setState(() => _misses++);
      return;
    }
    if (outcome == GuessOutcome.correct) {
      await _celebrate();
      return;
    }
    _finish();
  }

  /// 正解の演出（celebration.dart）を出し、終わったら結果へ移る。画面のどこを押しても、すぐに結果へ移る。
  /// 動きを止める設定では、札だけを見せて 0.7 秒置く。
  Future<void> _celebrate() async {
    await Future<void>.delayed(dsStill(context) ? const Duration(milliseconds: 700) : celebrationLength);
    _finish();
  }

  Future<void> _giveUp() async {
    final ok = await showConfirmSheet(context, title: 'あきらめますか？', body: '不正解として記録されます。', action: 'あきらめる', danger: true);
    if (!ok || !mounted) return;
    s.giveUp();
    _finish();
  }

  Future<void> _revealAll() async {
    final ok = await showConfirmSheet(context, title: 'すべて表示しますか？', body: '正解しても、ランクは C になります。', action: 'すべて表示');
    if (ok && mounted) s.revealAll();
  }

  @override
  Widget build(BuildContext context) {
    final daily = s.mode == QuizMode.daily;
    final full = s.unveil >= s.total;
    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: _won ? _finish : null,
        child: Celebration(
          active: _won,
          rank: s.finalRank,
          name: s.player.name,
          child: AbsorbPointer(
            absorbing: _won,
            child: Column(
              children: [
                DsPageHeader(
                  title: widget.title ?? (daily ? '今日の1問 No.${profile.dailyNumber}' : 'マニュアルモード'),
                  accentColor: daily ? DsColor.actionEmphasis : DsColor.rankHighlight,
                  leading: DsHeaderIconButton(icon: DsGlyph.close, tooltip: 'あきらめる', onPressed: _giveUp),
                  trailing: widget.trailing?.call(s),
                ),
                Expanded(
                  child: Stack(
                    children: [
                      // 行の高さを、使える高さと年数から決める（24〜34）。長い選手でも表が 1 画面に収まり、遊んでいる間にスクロールしなくて済む。
                      // 150 は、余白、目盛り、表の見出しと枠の高さの合計に、下端の余裕を足したもの。
                      LayoutBuilder(
                        builder: (context, box) => ListView(
                          padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
                          children: [
                            ?widget.above?.call(s),
                            RankMeter(session: s, labels: widget.meterLabels, wrongNames: s.wrongNames),
                            const SizedBox(height: DsSpacing.space12),
                            StatsTable(session: s, cascade: _won, rowHeight: ((box.maxHeight - 150) / s.yearCount).clamp(24.0, 34.0)),
                          ],
                        ),
                      ),
                      Positioned(
                        top: 12,
                        left: 20,
                        right: 20,
                        child: Center(
                          child: MissBanner(name: s.wrongNames.lastOrNull, trigger: _misses, extra: widget.missExtra?.call(s)),
                        ),
                      ),
                    ],
                  ),
                ),
                DsBottomActionBar(
                  child: Row(
                    children: [
                      // 今日の1問は全部を開けられないので、補助は「次を表示」だけにする。
                      if (!daily) ...[
                        Expanded(
                          flex: 3,
                          child: DsButton(label: 'すべて表示', type: DsButtonType.outline, tight: true, onPressed: full ? null : _revealAll),
                        ),
                        const SizedBox(width: DsSpacing.space8),
                      ],
                      Expanded(
                        flex: 5,
                        child: DsButton(label: '回答する', icon: DsGlyph.baseball, onPressed: _answer),
                      ),
                      const SizedBox(width: DsSpacing.space8),
                      Expanded(
                        flex: 3,
                        child: DsButton(label: '次を表示', type: DsButtonType.outline, tight: true, onPressed: full ? null : s.revealNext),
                      ),
                    ],
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
            child: DsIcon(DsGlyph.baseball, size: 22, color: i < left ? DsColor.contentPrimary : DsColor.disabledSurface),
          ),
      ],
    ),
  );
}
