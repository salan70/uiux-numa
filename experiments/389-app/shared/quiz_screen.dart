import 'package:flutter/material.dart';

import 'app.dart';
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

  /// 答え合わせ。開いていないマスが左上から斜めの波で開き（約 0.6 秒）、正解の札と選手名が出る。
  /// 波が届いてから 0.5 秒置いて結果へ移る。画面のどこを押しても、すぐに結果へ移る。
  /// 動きを止める設定では、波を出さずに札だけを見せ、同じ間を置いて移る。
  Future<void> _celebrate() async {
    setState(() => _won = true);
    final still = dsStill(context);
    await Future<void>.delayed((still ? Duration.zero : StatsTable.waveLength(s)) + const Duration(milliseconds: 700));
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
                        StatsTable(session: s, cascade: _won),
                      ],
                    ),
                    if (_won)
                      Positioned(
                        top: 120,
                        left: 20,
                        right: 20,
                        child: Center(child: _CorrectStamp(name: s.player.name)),
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
    );
  }
}

/// 答え合わせの札。正解の文字と選手名を、緑の面に載せて表の上に置く。
/// 0.92 倍から少し行き過ぎて 1 倍に収まり（280ms）、影が 0 から 6px へ伸びて机に置かれたように見せる。
class _CorrectStamp extends StatefulWidget {
  const _CorrectStamp({required this.name});

  final String name;

  @override
  State<_CorrectStamp> createState() => _CorrectStampState();
}

class _CorrectStampState extends State<_CorrectStamp> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 280));

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

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: '正解。${widget.name}',
      excludeSemantics: true,
      child: AnimatedBuilder(
        animation: _t,
        builder: (context, child) {
          final v = Curves.easeOutBack.transform(_t.value);
          return Opacity(
            opacity: _t.value.clamp(0, 1),
            child: Transform.scale(
              scale: 0.92 + 0.08 * v,
              child: Container(
                padding: const EdgeInsets.fromLTRB(28, 14, 28, 16),
                decoration: BoxDecoration(
                  color: DsColor.statusSuccess,
                  borderRadius: DsRadius.borderMd,
                  border: Border.all(color: DsColor.onAction, width: DsBorder.standard),
                  boxShadow: [BoxShadow(color: DsColor.shadow, offset: Offset(0, 6 * _t.value))],
                ),
                child: child,
              ),
            ),
          );
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('正解！', style: DsTypography.headline1.copyWith(color: DsColor.onAction, height: 1.1)),
            const SizedBox(height: 2),
            Text(
              widget.name,
              style: DsTypography.body1.copyWith(color: DsColor.onAction, fontWeight: FontWeight.w700),
            ),
          ],
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
