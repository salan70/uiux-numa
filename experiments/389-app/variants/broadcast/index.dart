import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/profile.dart';

// broadcast: 伏せた成績表を、野球中継の成績テロップに見立てる。
// 斜めに切った帯、赤と金、傾けた太字で、画面を「中継の画」にする。開示はテロップの帯を光が拭く動き、正解は中継の場面転換（斜めの帯が画面を横切る）にする。
// 遊ぶ人を打者に見立てる製品の比喩（.389 は打率）を、ホームとマイ成績の「打者の成績テロップ」で前に出す。
// 今日の1問の 3 回はアウトカウント、ノーマルの外れはストライクの数として、野球の数え方で見せる。
// 動きは中継の文法に合わせ、短く鋭い拭き（240ms）を多用し、正解の場面転換だけを長く（900ms）する。

Widget buildVariant() => QuizApp(
  title: '.389',
  theme: _theme,
  screens: {
    'home': (_) => const _Home(),
    'quiz': (_) => _Quiz(session: sampleSession()),
    'quizMid': (_) => _Quiz(session: sampleSession(reveal: 7)),
    'answer': (_) => _Quiz(session: sampleSession(reveal: 7), openAnswer: true),
    'wrong': (_) => _Quiz(session: _wrongSession(sampleSession(reveal: 7))),
    'result': (_) {
      final s = sampleSession(reveal: 5);
      s.guess(s.player.name);
      return _Result(session: s);
    },
    'daily': (_) => _Quiz(session: _wrongSession(sampleSession(reveal: 4, mode: QuizMode.daily))),
    'dailyFail': (_) {
      final s = sampleSession(reveal: 12, mode: QuizMode.daily);
      for (final n in ['山田 哲人', '近藤 健介', '浅村 栄斗']) {
        s.guess(n);
      }
      return _Result(session: s);
    },
    'stats': (_) => const _Sheet(),
  },
);

Widget buildPanel() => const JumpPanel();

QuizSession _wrongSession(QuizSession s) {
  s.guess(s.player.name == '山田 哲人' ? '坂本 勇人' : '山田 哲人');
  return s;
}

/// 中継の画は夜の球場の暗さを前提にするので、端末の明暗に関わらず同じ配色にする。
abstract final class _C {
  static const night = Color(0xFF061029);
  static const deep = Color(0xFF0B1A3D);
  static const bar = Color(0xFF13285A);
  static const barLight = Color(0xFF1E3A78);
  static const white = Color(0xFFFFFFFF);
  static const mute = Color(0xFF8EA0C4);
  static const red = Color(0xFFE5173A);
  static const gold = Color(0xFFFFC52E);
}

Color _rankColor(Rank r) => switch (r) {
  Rank.ss => _C.gold,
  Rank.s => _C.white,
  Rank.a => const Color(0xFF9FD0FF),
  Rank.b => const Color(0xFF9FB3D9),
  Rank.c => _C.mute,
  Rank.miss => _C.red,
};

final _theme = ThemeData(
  useMaterial3: true,
  fontFamily: 'LINE Seed JP',
  scaffoldBackgroundColor: _C.night,
  colorScheme: ColorScheme.fromSeed(seedColor: _C.red, brightness: Brightness.dark, surface: _C.deep),
  bottomSheetTheme: const BottomSheetThemeData(backgroundColor: _C.deep, surfaceTintColor: Colors.transparent),
);

bool _still(BuildContext context) => MediaQuery.disableAnimationsOf(context);

/// 帯の傾き。中継のテロップに倣い、右上がりに切る。
const _skew = 0.22;

/// 斜めに切った帯。
class _Slant extends StatelessWidget {
  const _Slant({required this.child, this.color = _C.bar, this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 6), this.left = true, this.right = true});

  final Widget child;
  final Color color;
  final EdgeInsets padding;
  final bool left;
  final bool right;

  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: _SlantClipper(left: left, right: right),
      child: Container(color: color, padding: padding, child: child),
    );
  }
}

class _SlantClipper extends CustomClipper<Path> {
  _SlantClipper({required this.left, required this.right});

  final bool left;
  final bool right;

  @override
  Path getClip(Size size) {
    final d = size.height * _skew;
    return Path()
      ..moveTo(left ? d : 0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(right ? size.width - d : size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
  }

  @override
  bool shouldReclip(covariant _SlantClipper old) => old.left != left || old.right != right;
}

/// 傾けた太字。中継の見出しの声の大きさを出す。
class _Loud extends StatelessWidget {
  const _Loud(this.text, {this.size = 20, this.color = _C.white, this.spacing = 0});

  final String text;
  final double size;
  final Color color;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Transform(
      transform: Matrix4.skewX(-0.18),
      child: Text(text, style: TextStyle(color: color, fontSize: size, fontWeight: FontWeight.w700, height: 1.05, letterSpacing: spacing)),
    );
  }
}

/// 押すと少し縮み、斜めの光が走る。
class _Action extends StatefulWidget {
  const _Action({required this.label, required this.onTap, this.color = _C.red, this.ink = _C.white, this.icon});

  final String label;
  final VoidCallback? onTap;
  final Color color;
  final Color ink;
  final IconData? icon;

  @override
  State<_Action> createState() => _ActionState();
}

class _ActionState extends State<_Action> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null;
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      child: GestureDetector(
        onTapDown: enabled ? (_) => setState(() => _down = true) : null,
        onTapCancel: () => setState(() => _down = false),
        onTapUp: enabled
            ? (_) {
                setState(() => _down = false);
                widget.onTap!();
              }
            : null,
        child: AnimatedScale(
          scale: _down ? 0.96 : 1,
          duration: const Duration(milliseconds: 80),
          child: SizedBox(
            height: 58,
            child: _Slant(
              color: enabled ? widget.color : _C.bar,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.icon != null) ...[Icon(widget.icon, color: enabled ? widget.ink : _C.mute, size: 20), const SizedBox(width: 8)],
                    _Loud(widget.label, size: 19, color: enabled ? widget.ink : _C.mute),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 帯が左から差し込まれる入場。中継のテロップの出方。
class _WipeIn extends StatefulWidget {
  const _WipeIn({required this.child, this.delay = Duration.zero});

  final Widget child;
  final Duration delay;

  @override
  State<_WipeIn> createState() => _WipeInState();
}

class _WipeInState extends State<_WipeIn> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 340));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_still(context)) {
      _t.value = 1;
    } else if (_t.value == 0 && !_t.isAnimating) {
      Future<void>.delayed(widget.delay, () {
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
    return AnimatedBuilder(
      animation: _t,
      builder: (context, child) {
        final v = Curves.easeOutCubic.transform(_t.value);
        return ClipRect(
          child: Align(
            alignment: Alignment.centerLeft,
            widthFactor: v,
            child: Transform.translate(offset: Offset((1 - v) * -24, 0), child: child),
          ),
        );
      },
      child: widget.child,
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
  Future<void> _go(Widget screen) async {
    await Navigator.of(context).push(_stinger(screen));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final p = profile;
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: CustomPaint(painter: _FloodlightPainter())),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                Row(
                  children: [
                    _Slant(color: _C.red, padding: const EdgeInsets.fromLTRB(12, 4, 16, 4), left: false, child: const _Loud('.389', size: 22)),
                    const SizedBox(width: 10),
                    const Text('プロ野球クイズ', style: TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 28),
                _WipeIn(
                  child: Row(
                    children: [
                      _Slant(
                        color: p.dailyDone ? _C.bar : _C.red,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                        child: Row(
                          children: [
                            if (!p.dailyDone) const _LiveDot(),
                            if (!p.dailyDone) const SizedBox(width: 6),
                            Text(p.dailyDone ? '試合終了' : '配信中', style: const TextStyle(color: _C.white, fontSize: 11, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('No.${p.dailyNumber}　毎日 19:00 更新', style: const TextStyle(color: _C.mute, fontSize: 11)),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                const _WipeIn(delay: Duration(milliseconds: 80), child: _Loud('今日の1問', size: 52, spacing: 1)),
                const SizedBox(height: 6),
                _WipeIn(
                  delay: const Duration(milliseconds: 160),
                  child: Text(
                    p.dailyDone ? '今日の打席は終わりました。次は ${p.untilNext.inHours}時間${p.untilNext.inMinutes % 60}分後' : 'スリーアウトまで答えられる。全員が同じ選手に挑む',
                    style: const TextStyle(color: _C.mute, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 18),
                _Action(
                  label: p.dailyDone ? '結果を見る' : 'プレイボール',
                  icon: p.dailyDone ? Icons.replay : Icons.sports_baseball,
                  color: p.dailyDone ? _C.barLight : _C.red,
                  onTap: p.dailyDone ? null : () => _go(_Quiz(session: _dailySession())),
                ),
                const SizedBox(height: 12),
                _Action(
                  label: 'ノーマルで遊ぶ',
                  icon: Icons.play_arrow,
                  color: _C.gold,
                  ink: _C.night,
                  onTap: () => _go(_Quiz(session: _normalSession())),
                ),
                const Padding(
                  padding: EdgeInsets.only(top: 6, left: 4),
                  child: Text('全球団・通算 300 試合以上から出題', style: TextStyle(color: _C.mute, fontSize: 11)),
                ),
                const SizedBox(height: 28),
                GestureDetector(onTap: () => _go(const _Sheet()), child: const _BatterTelop()),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

QuizSession _normalSession() => QuizSession(player: quizPlayers[DateTime.now().millisecond % quizPlayers.length]);

QuizSession _dailySession() => QuizSession(player: quizPlayers[profile.dailyNumber % quizPlayers.length], mode: QuizMode.daily, seed: profile.dailyNumber);

/// 照明塔の光。画面の上に斜めの光の筋を置き、夜の球場の中継の空気を作る。
class _FloodlightPainter extends CustomPainter {
  const _FloodlightPainter();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFF10265A), _C.night]).createShader(Offset.zero & size),
    );
    final beam = Paint()
      ..shader = LinearGradient(colors: [Colors.white.withValues(alpha: 0.07), Colors.white.withValues(alpha: 0)]).createShader(Rect.fromLTWH(0, 0, size.width, size.height * 0.6));
    for (final (x, w) in [(0.55, 60.0), (0.75, 30.0), (0.9, 80.0)]) {
      canvas.drawPath(
        Path()
          ..moveTo(size.width * x, 0)
          ..lineTo(size.width * x + w, 0)
          ..lineTo(size.width * x + w - size.height * 0.5, size.height * 0.6)
          ..lineTo(size.width * x - size.height * 0.5, size.height * 0.6)
          ..close(),
        beam,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _LiveDot extends StatefulWidget {
  const _LiveDot();

  @override
  State<_LiveDot> createState() => _LiveDotState();
}

class _LiveDotState extends State<_LiveDot> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_still(context) && !_t.isAnimating) _t.repeat(reverse: true);
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: Tween(begin: 0.35, end: 1.0).animate(_t),
    child: Container(width: 7, height: 7, decoration: const BoxDecoration(color: _C.white, shape: BoxShape.circle)),
  );
}

/// ホームの下の「打者の成績テロップ」。遊ぶ人を打者として、打率と打数と安打を出す。
class _BatterTelop extends StatelessWidget {
  const _BatterTelop();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    return _WipeIn(
      delay: const Duration(milliseconds: 240),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _Slant(color: _C.gold, padding: const EdgeInsets.fromLTRB(10, 3, 14, 3), left: false, child: const Text('打者', style: TextStyle(color: _C.night, fontSize: 11, fontWeight: FontWeight.w700))),
              _Slant(color: _C.white, padding: const EdgeInsets.fromLTRB(12, 3, 16, 3), child: const Text('あなた', style: TextStyle(color: _C.night, fontSize: 13, fontWeight: FontWeight.w700))),
              const Spacer(),
              const Text('成績を見る ›', style: TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 2),
          _Slant(
            color: _C.bar,
            left: false,
            padding: const EdgeInsets.fromLTRB(14, 10, 22, 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _TelopStat(label: '打率', value: p.average, big: true),
                _TelopStat(label: '打数', value: '${p.plays}'),
                _TelopStat(label: '安打', value: '${p.correct}'),
                _TelopStat(label: 'SS', value: '${p.count(Rank.ss)}'),
                _TelopStat(label: '連続', value: '${p.streak}日'),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Text('今週', style: TextStyle(color: _C.mute, fontSize: 11)),
              const SizedBox(width: 10),
              for (var i = 0; i < 7; i++) ...[
                Column(
                  children: [
                    _Slant(color: p.weekDays.contains(i) ? _C.gold : _C.bar, padding: EdgeInsets.zero, child: const SizedBox(width: 26, height: 10)),
                    const SizedBox(height: 3),
                    Text('月火水木金土日'[i], style: TextStyle(color: i == Profile.today ? _C.white : _C.mute, fontSize: 9)),
                  ],
                ),
                const SizedBox(width: 4),
              ],
              const Spacer(),
              Text('最長 ${p.bestStreak}日', style: const TextStyle(color: _C.mute, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TelopStat extends StatelessWidget {
  const _TelopStat({required this.label, required this.value, this.big = false});

  final String label;
  final String value;
  final bool big;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(right: big ? 18 : 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: _C.mute, fontSize: 10, fontWeight: FontWeight.w700)),
          _Loud(value, size: big ? 40 : 20),
        ],
      ),
    );
  }
}

// ───────────────────────── クイズ ─────────────────────────

class _Quiz extends StatefulWidget {
  const _Quiz({required this.session, this.openAnswer = false});

  final QuizSession session;
  final bool openAnswer;

  @override
  State<_Quiz> createState() => _QuizState();
}

class _QuizState extends State<_Quiz> with SingleTickerProviderStateMixin {
  QuizSession get s => widget.session;
  late final _band = AnimationController(vsync: this, duration: const Duration(milliseconds: 760));

  @override
  void initState() {
    super.initState();
    s.addListener(_changed);
    if (widget.openAnswer) WidgetsBinding.instance.addPostFrameCallback((_) => _answer());
  }

  @override
  void dispose() {
    s.removeListener(_changed);
    _band.dispose();
    super.dispose();
  }

  void _changed() => setState(() {});

  Future<void> _answer() async {
    final name = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(),
      builder: (_) => _AnswerSheet(wrong: s.wrongNames),
    );
    if (name == null || !mounted) return;
    final outcome = s.guess(name);
    if (outcome == GuessOutcome.wrong) {
      if (!_still(context)) _band.forward(from: 0);
      return;
    }
    Navigator.of(context).pushReplacement(_stinger(_Result(session: s)));
  }

  Future<void> _menu() async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (s.mode == QuizMode.normal)
              ListTile(
                leading: const Icon(Icons.grid_on),
                title: const Text('全部開ける'),
                subtitle: const Text('当てても C になります'),
                onTap: () => Navigator.pop(context, 'all'),
              ),
            ListTile(
              leading: const Icon(Icons.flag_outlined, color: _C.red),
              title: const Text('あきらめて答えを見る', style: TextStyle(color: _C.red)),
              onTap: () => Navigator.pop(context, 'give'),
            ),
          ],
        ),
      ),
    );
    if (!mounted) return;
    if (choice == 'all') s.revealAll();
    if (choice == 'give') {
      s.giveUp();
      Navigator.of(context).pushReplacement(_stinger(_Result(session: s)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(4, 4, 4, 0),
                  child: Row(
                    children: [
                      IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.white), tooltip: '閉じる'),
                      Expanded(child: _ScoreBug(session: s)),
                      IconButton(onPressed: _menu, icon: const Icon(Icons.more_horiz, color: _C.white), tooltip: 'そのほか'),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                    child: _Telop(session: s),
                  ),
                ),
                if (s.wrongNames.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
                    child: SizedBox(
                      width: double.infinity,
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          for (final n in s.wrongNames)
                            _Slant(
                              color: _C.red.withValues(alpha: 0.2),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                              child: Text('× $n', style: const TextStyle(color: Color(0xFFFF8A9C), fontSize: 11, fontWeight: FontWeight.w700)),
                            ),
                        ],
                      ),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 5,
                        child: _Action(label: s.unveil >= s.total ? '全部出た' : '次の成績', icon: Icons.flash_on, color: _C.white, ink: _C.night, onTap: s.unveil >= s.total ? null : s.revealNext),
                      ),
                      const SizedBox(width: 4),
                      Expanded(flex: 4, child: _Action(label: '回答', icon: Icons.mic, onTap: _answer)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_band.isAnimating) Positioned.fill(child: IgnorePointer(child: _MissBand(t: _band))),
        ],
      ),
    );
  }
}

/// 中継のスコア表示に倣った小さな帯。開示、いまのランク、外れ（今日の1問はアウト）を 1 列に並べる。
class _ScoreBug extends StatelessWidget {
  const _ScoreBug({required this.session});

  final QuizSession session;

  @override
  Widget build(BuildContext context) {
    final s = session;
    final daily = s.mode == QuizMode.daily;
    final rank = s.rankNow;
    final left = s.cellsBeforeDrop;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _Slant(
          color: _C.red,
          padding: const EdgeInsets.fromLTRB(10, 5, 12, 5),
          left: false,
          child: Text(daily ? '今日の1問' : 'ノーマル', style: const TextStyle(color: _C.white, fontSize: 11, fontWeight: FontWeight.w700)),
        ),
        _Slant(
          color: _C.bar,
          padding: const EdgeInsets.fromLTRB(12, 3, 12, 3),
          child: Row(
            children: [
              const Text('開示 ', style: TextStyle(color: _C.mute, fontSize: 10)),
              Text('${s.unveil}/${s.total}', style: const TextStyle(color: _C.white, fontSize: 14, fontWeight: FontWeight.w700)),
              const SizedBox(width: 10),
              Text(rank.label, style: TextStyle(color: _rankColor(rank), fontSize: 16, fontWeight: FontWeight.w700)),
              Text(left == null || left > 3 ? '' : ' あと$left', style: TextStyle(color: left != null && left <= 0 ? _C.red : _C.mute, fontSize: 10)),
            ],
          ),
        ),
        _Slant(
          color: _C.deep,
          padding: const EdgeInsets.fromLTRB(10, 6, 12, 6),
          right: false,
          child: Semantics(
            label: daily ? 'アウト ${s.incorrect}' : 'ストライク ${s.incorrect}',
            child: Row(
              children: [
                Text(daily ? 'O ' : 'S ', style: const TextStyle(color: _C.mute, fontSize: 10, fontWeight: FontWeight.w700)),
                if (daily)
                  for (var i = 0; i < QuizSession.dailyLives; i++)
                    Container(
                      width: 9,
                      height: 9,
                      margin: const EdgeInsets.only(left: 3),
                      decoration: BoxDecoration(shape: BoxShape.circle, color: i < s.incorrect ? _C.red : _C.barLight),
                    )
                else
                  Text('${s.incorrect}', style: const TextStyle(color: _C.white, fontSize: 12, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// 成績テロップ。1 年度を 1 本の帯にし、伏せた値は斜線の溝にする。
class _Telop extends StatelessWidget {
  const _Telop({required this.session});

  final QuizSession session;

  @override
  Widget build(BuildContext context) {
    final s = session;
    return Column(
      children: [
        Row(
          children: [
            _Slant(
              color: _C.gold,
              padding: const EdgeInsets.fromLTRB(12, 4, 16, 4),
              left: false,
              child: const Text('この選手はだれ？', style: TextStyle(color: _C.night, fontSize: 13, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(width: 8),
            Text('年度別打撃成績・${s.yearCount}年', style: const TextStyle(color: _C.mute, fontSize: 11)),
          ],
        ),
        const SizedBox(height: 6),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: _cols(['年度', ...s.stats].map((h) => Text(h, textAlign: TextAlign.center, style: const TextStyle(color: _C.mute, fontSize: 10, fontWeight: FontWeight.w700))).toList()),
        ),
        const SizedBox(height: 4),
        Expanded(
          child: LayoutBuilder(
            builder: (context, box) {
              final h = ((box.maxHeight - s.yearCount * 3) / s.yearCount).clamp(18.0, 30.0);
              return SingleChildScrollView(
                child: Column(
                  children: [
                    for (var r = 0; r < s.yearCount; r++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: SizedBox(
                          height: h,
                          child: _Slant(
                            color: r.isEven ? _C.bar : const Color(0xFF102350),
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: _cols([
                              Text(s.year(r), textAlign: TextAlign.center, style: const TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
                              for (var c = 0; c < s.stats.length; c++)
                                _Value(text: s.value(r, c), revealed: s.isRevealed(r, c), fresh: s.lastRevealed == (r, c) && !s.isOver),
                            ]),
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _cols(List<Widget> cells) => Row(
    children: [for (var i = 0; i < cells.length; i++) Expanded(flex: i == 0 ? 4 : 5, child: cells[i])],
  );
}

/// テロップの 1 値。開くときは白い光が左から右へ拭き、拭いた跡に値が残る。
class _Value extends StatefulWidget {
  const _Value({required this.text, required this.revealed, required this.fresh});

  final String text;
  final bool revealed;
  final bool fresh;

  @override
  State<_Value> createState() => _ValueState();
}

class _ValueState extends State<_Value> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 240), value: 1);

  @override
  void didUpdateWidget(_Value old) {
    super.didUpdateWidget(old);
    if (!old.revealed && widget.revealed && widget.fresh && !_still(context)) _t.forward(from: 0);
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 3),
      child: AnimatedBuilder(
        animation: _t,
        builder: (context, _) {
          final v = _t.value;
          final text = FittedBox(
            fit: BoxFit.scaleDown,
            child: _Loud(widget.text, size: 15, color: widget.fresh ? _C.gold : _C.white),
          );
          if (!widget.revealed) return const CustomPaint(painter: _HatchPainter(), child: SizedBox.expand());
          if (v >= 1) return Center(child: text);
          return LayoutBuilder(
            builder: (context, box) {
              final x = Curves.easeOutCubic.transform(v) * (box.maxWidth + 24);
              return Stack(
                children: [
                  ClipRect(clipper: _LeftClip(x - 12), child: Center(child: text)),
                  ClipRect(clipper: _RightClip(x), child: const CustomPaint(painter: _HatchPainter(), child: SizedBox.expand())),
                  Positioned(left: x - 14, top: 0, bottom: 0, child: Transform(transform: Matrix4.skewX(-0.35), child: Container(width: 10, color: _C.white))),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _LeftClip extends CustomClipper<Rect> {
  _LeftClip(this.x);

  final double x;

  @override
  Rect getClip(Size size) => Rect.fromLTWH(0, 0, x.clamp(0, size.width), size.height);

  @override
  bool shouldReclip(covariant _LeftClip old) => old.x != x;
}

class _RightClip extends CustomClipper<Rect> {
  _RightClip(this.x);

  final double x;

  @override
  Rect getClip(Size size) => Rect.fromLTRB(x.clamp(0, size.width), 0, size.width, size.height);

  @override
  bool shouldReclip(covariant _RightClip old) => old.x != x;
}

class _HatchPainter extends CustomPainter {
  const _HatchPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final r = RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(2));
    canvas.drawRRect(r, Paint()..color = const Color(0xFF071534));
    canvas.save();
    canvas.clipRRect(r);
    final p = Paint()
      ..color = const Color(0xFF1A3266)
      ..strokeWidth = 1.5;
    for (var x = -size.height; x < size.width; x += 6) {
      canvas.drawLine(Offset(x, size.height), Offset(x + size.height, 0), p);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// 外れたときに画面を横切る赤い帯。
class _MissBand extends StatelessWidget {
  const _MissBand({required this.t});

  final Animation<double> t;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: t,
      builder: (context, _) {
        final v = t.value;
        final inX = Curves.easeOutExpo.transform((v / 0.35).clamp(0, 1));
        final outX = Curves.easeInCubic.transform(((v - 0.7) / 0.3).clamp(0, 1));
        final w = MediaQuery.sizeOf(context).width;
        return Center(
          child: Transform.translate(
            offset: Offset((1 - inX) * w - outX * w, 0),
            child: Transform.rotate(
              angle: -0.08,
              child: SizedBox(
                width: w * 1.3,
                child: _Slant(
                  color: _C.red,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  child: const Center(child: _Loud('ちがう！', size: 44, spacing: 4)),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AnswerSheet extends StatefulWidget {
  const _AnswerSheet({required this.wrong});

  final List<String> wrong;

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
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(height: 4, color: _C.red),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _Loud('回答', size: 22),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _text,
                    autofocus: true,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(color: _C.white, fontSize: 17, fontWeight: FontWeight.w700),
                    cursorColor: _C.gold,
                    decoration: const InputDecoration(
                      hintText: '名前の一部（例: 柳田）',
                      hintStyle: TextStyle(color: _C.mute, fontWeight: FontWeight.w400),
                      filled: true,
                      fillColor: _C.night,
                      border: OutlineInputBorder(borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 264,
                    child: hits.isEmpty
                        ? Center(child: Text(_text.text.isEmpty ? '名前を入れると候補が出ます' : '該当する選手がいません', style: const TextStyle(color: _C.mute)))
                        : ListView(
                            children: [
                              for (final n in hits)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: GestureDetector(
                                    onTap: widget.wrong.contains(n) ? null : () => Navigator.pop(context, n),
                                    child: _Slant(
                                      color: widget.wrong.contains(n) ? _C.night : _C.bar,
                                      padding: const EdgeInsets.fromLTRB(16, 12, 20, 12),
                                      child: Row(
                                        children: [
                                          Text(
                                            n,
                                            style: TextStyle(
                                              color: widget.wrong.contains(n) ? _C.mute : _C.white,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w700,
                                              decoration: widget.wrong.contains(n) ? TextDecoration.lineThrough : null,
                                            ),
                                          ),
                                          const Spacer(),
                                          if (widget.wrong.contains(n)) const Text('外れ', style: TextStyle(color: _C.red, fontSize: 11)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
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
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_still(context)) {
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

  Animation<double> _seg(double a, double b) => CurvedAnimation(parent: _t, curve: Interval(a, b, curve: Curves.easeOutCubic));

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final rank = s.finalRank;
    final won = s.status == QuizStatus.correct;
    final team = teamShort[s.player.team] ?? s.player.team;
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: CustomPaint(painter: _FloodlightPainter())),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.white), tooltip: '閉じる'),
                const Spacer(),
                _Rise(
                  t: _seg(0.0, 0.35),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 20),
                    child: _Loud(won ? '正解！' : (s.status == QuizStatus.failed ? 'スリーアウト' : '答え'), size: 30, color: won ? _C.gold : _C.red),
                  ),
                ),
                const SizedBox(height: 10),
                _Rise(
                  t: _seg(0.12, 0.5),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 20, right: 20),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _Loud(s.player.name, size: 46, spacing: 2),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _Slant(color: _C.white, padding: const EdgeInsets.fromLTRB(10, 2, 14, 2), left: false, child: Text(team, style: const TextStyle(color: _C.night, fontSize: 12, fontWeight: FontWeight.w700))),
                                  const SizedBox(width: 8),
                                  Text('在籍 ${s.yearCount} 年・2025年終了時', style: const TextStyle(color: _C.mute, fontSize: 12)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                _Rise(
                  t: _seg(0.3, 0.7),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _ScaleIn(
                          t: _seg(0.4, 0.75),
                          child: _Slant(
                            color: won ? _C.bar : _C.deep,
                            padding: const EdgeInsets.fromLTRB(22, 4, 26, 4),
                            child: Column(
                              children: [
                                const Text('ランク', style: TextStyle(color: _C.mute, fontSize: 10, fontWeight: FontWeight.w700)),
                                _Loud(rank.label, size: 64, color: _rankColor(rank)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _Line(label: '開示', value: '${s.unveil}/${s.total}', note: '${(s.rate * 100).round()}%'),
                              const SizedBox(height: 6),
                              _Line(label: s.mode == QuizMode.daily ? 'アウト' : '外れ', value: '${s.incorrect}', note: '回'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                _Rise(
                  t: _seg(0.5, 0.85),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Text(_comment(s, rank), style: const TextStyle(color: _C.white, fontSize: 14)),
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: _Action(label: '共有', icon: Icons.ios_share, color: _C.barLight, onTap: () => _share(context))),
                      const SizedBox(width: 4),
                      Expanded(
                        flex: 3,
                        child: _Action(
                          label: s.mode == QuizMode.daily ? 'ノーマルへ' : '次の打席',
                          icon: Icons.play_arrow,
                          color: _C.gold,
                          ink: _C.night,
                          onTap: () => Navigator.of(context).pushReplacement(_stinger(_Quiz(session: _normalSession()))),
                        ),
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

  void _share(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => const SafeArea(
        child: Padding(padding: EdgeInsets.all(24), child: Text('製品では、結果のテロップを画像にして OS の共有シートを開く。試作では開かない。')),
      ),
    );
  }
}

/// 実況の一言。
String _comment(QuizSession s, Rank r) {
  if (s.status != QuizStatus.correct) return '手がかりは ${s.unveil} 個でした。表で答えを確かめられます。';
  return switch (r) {
    Rank.ss => '${s.unveil} 個の数字だけで見抜いた。初球打ちのホームラン。',
    Rank.s => '少ない手がかりで捉えた。痛烈な当たり。',
    Rank.a => 'しっかり見極めてのヒット。',
    Rank.b => '粘って運んだヒット。',
    _ => '最後は執念で落とした。',
  };
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value, required this.note});

  final String label;
  final String value;
  final String note;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        SizedBox(width: 44, child: Text(label, style: const TextStyle(color: _C.mute, fontSize: 11, fontWeight: FontWeight.w700))),
        _Loud(value, size: 22),
        const SizedBox(width: 6),
        Text(note, style: const TextStyle(color: _C.mute, fontSize: 12)),
      ],
    );
  }
}

class _Rise extends StatelessWidget {
  const _Rise({required this.t, required this.child});

  final Animation<double> t;
  final Widget child;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: t,
    builder: (context, child) => Opacity(
      opacity: t.value,
      child: Transform.translate(offset: Offset((1 - t.value) * -40, 0), child: child),
    ),
    child: child,
  );
}

class _ScaleIn extends StatelessWidget {
  const _ScaleIn({required this.t, required this.child});

  final Animation<double> t;
  final Widget child;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: t,
    builder: (context, child) => Transform.scale(scale: 1.6 - 0.6 * Curves.easeOutBack.transform(t.value), child: child),
    child: child,
  );
}

// ───────────────────────── マイ成績（打者の成績表） ─────────────────────────

class _Sheet extends StatelessWidget {
  const _Sheet();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final maxCount = [for (final r in Rank.values) p.count(r)].reduce(math.max).clamp(1, 999);
    final col = p.collection;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          children: [
            Row(
              children: [
                IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back, color: _C.white), tooltip: '戻る'),
                const _Loud('打者成績', size: 20),
              ],
            ),
            const SizedBox(height: 12),
            const _WipeIn(child: _Loud('あなた', size: 40, spacing: 2)),
            const SizedBox(height: 4),
            _WipeIn(
              delay: const Duration(milliseconds: 80),
              child: _Slant(
                left: false,
                padding: const EdgeInsets.fromLTRB(14, 10, 22, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _TelopStat(label: '打率', value: p.average, big: true),
                    _TelopStat(label: '打数', value: '${p.plays}'),
                    _TelopStat(label: '安打', value: '${p.correct}'),
                    _TelopStat(label: '連続', value: '${p.streak}日'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('ランク別', style: TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            for (final (i, r) in Rank.values.indexed)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    SizedBox(width: 36, child: _Loud(r == Rank.miss ? '凡退' : r.label, size: 13, color: _rankColor(r))),
                    Expanded(
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: _WipeIn(
                          delay: Duration(milliseconds: 160 + i * 60),
                          child: FractionallySizedBox(
                            widthFactor: math.max(0.04, p.count(r) / maxCount),
                            child: _Slant(
                              color: r == Rank.ss ? _C.gold : (r == Rank.miss ? _C.red.withValues(alpha: 0.6) : _C.barLight),
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                              child: Text('${p.count(r)}', textAlign: TextAlign.right, style: TextStyle(color: r == Rank.ss ? _C.night : _C.white, fontSize: 12, fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            const Text('正解した選手　球団別', style: TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 6,
              crossAxisSpacing: 2,
              childAspectRatio: 2.8,
              children: [
                for (final t in teamOrder)
                  _Slant(
                    color: col[t]!.length == Profile.teamSize[t] && col[t]!.isNotEmpty ? _C.gold : _C.bar,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            t,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(color: col[t]!.length == Profile.teamSize[t] && col[t]!.isNotEmpty ? _C.night : _C.white, fontSize: 12, fontWeight: FontWeight.w700),
                          ),
                        ),
                        Text(
                          '${col[t]!.length}/${Profile.teamSize[t]}',
                          style: TextStyle(color: col[t]!.length == Profile.teamSize[t] && col[t]!.isNotEmpty ? _C.night : _C.mute, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('最近の打席', style: TextStyle(color: _C.mute, fontSize: 12, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            for (final r in p.records.take(10))
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: _Slant(
                  color: _C.deep,
                  padding: const EdgeInsets.fromLTRB(14, 8, 18, 8),
                  child: Row(
                    children: [
                      SizedBox(width: 44, child: Text(r.day == 0 ? '今日' : '${r.day}日前', style: const TextStyle(color: _C.mute, fontSize: 11))),
                      if (r.daily)
                        const Padding(
                          padding: EdgeInsets.only(right: 6),
                          child: Text('1問', style: TextStyle(color: _C.red, fontSize: 10, fontWeight: FontWeight.w700)),
                        ),
                      Expanded(child: Text(r.player.name, style: const TextStyle(color: _C.white, fontSize: 14, fontWeight: FontWeight.w700))),
                      Text('${r.unveilPercent}%', style: const TextStyle(color: _C.mute, fontSize: 11)),
                      const SizedBox(width: 10),
                      SizedBox(width: 26, child: _Loud(r.rank.label, size: 15, color: _rankColor(r.rank))),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// 中継の場面転換。赤、金、紺の斜めの帯が画面を横切り、抜けた後に次の画面がある。
PageRoute<void> _stinger(Widget screen) => PageRouteBuilder<void>(
  transitionDuration: const Duration(milliseconds: 900),
  reverseTransitionDuration: const Duration(milliseconds: 200),
  pageBuilder: (_, _, _) => screen,
  transitionsBuilder: (context, a, _, child) {
    if (MediaQuery.disableAnimationsOf(context)) return FadeTransition(opacity: a, child: child);
    return AnimatedBuilder(
      animation: a,
      builder: (context, _) {
        final v = a.value;
        final w = MediaQuery.sizeOf(context).width;
        return Stack(
          children: [
            Opacity(opacity: v < 0.45 ? 0 : 1, child: child),
            for (final (i, c) in [_C.red, _C.gold, _C.deep].indexed)
              Positioned.fill(
                child: IgnorePointer(
                  child: Transform.translate(
                    offset: Offset((1.4 - Curves.easeInOutCubic.transform(((v - i * 0.08) / 0.84).clamp(0, 1)) * 2.8) * w, 0),
                    child: Transform(transform: Matrix4.skewX(-0.3), child: Container(color: c)),
                  ),
                ),
              ),
          ],
        );
      },
    );
  },
);
