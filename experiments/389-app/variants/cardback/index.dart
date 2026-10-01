import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/profile.dart';

// cardback: 伏せた成績表を、野球カードの裏面に見立てる。
// 正解するとカードを表へ返し、開示の少なさをカードのレア度（SS はホロ、S は金、A は銀、B は銅）として手元に残す。
// 情報構造は「パックを開ける」と「バインダー」の 2 か所にし、遊んだ結果を集める動機へつなぐ。
// 開示の代償を遊びの最中に見せるため、カードの下にレア度の目盛りを置き、いま当てたときのランクと落ちるまでのマス数を出す。
// 動きは頻度で予算を分ける。1 問に何十回もある開示は 220ms のインクの押印、1 問に 1 回の正解だけ 600ms の裏返しにする。

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
    'stats': (_) => const _Binder(),
  },
);

Widget buildPanel() => const JumpPanel();

QuizSession _wrongSession(QuizSession s) {
  s.guess(s.player.name == '山田 哲人' ? '坂本 勇人' : '山田 哲人');
  return s;
}

/// 配色。カードは常に紙の色で、机（背景）は暗い。カードという物を主役にするため、端末の明暗に関わらず同じにする。
abstract final class _C {
  static const table = Color(0xFF17212C);
  static const tableLift = Color(0xFF223040);
  static const chalk = Color(0xFFEDE5D6);
  static const chalkSoft = Color(0xFF98A2AE);
  static const paper = Color(0xFFF4ECDE);
  static const paperShade = Color(0xFFE8DCC8);
  static const ink = Color(0xFF1F1C19);
  static const inkSoft = Color(0xFF6F665A);
  static const navy = Color(0xFF22406A);
  static const red = Color(0xFFD43B2E);
  static const gold = Color(0xFFCFA43C);
  static const silver = Color(0xFFA7B0BA);
  static const bronze = Color(0xFFB4764B);
  static const plain = Color(0xFFCBBFA9);
}

Color _rarity(Rank r) => switch (r) {
  Rank.ss => const Color(0xFF6FD3E8),
  Rank.s => _C.gold,
  Rank.a => _C.silver,
  Rank.b => _C.bronze,
  Rank.c => _C.plain,
  Rank.miss => const Color(0xFF8C8C8C),
};

String _rarityName(Rank r) => switch (r) {
  Rank.ss => 'ホロ',
  Rank.s => 'ゴールド',
  Rank.a => 'シルバー',
  Rank.b => 'ブロンズ',
  Rank.c => 'ノーマル',
  Rank.miss => '—',
};

final _theme = ThemeData(
  useMaterial3: true,
  fontFamily: 'LINE Seed JP',
  scaffoldBackgroundColor: _C.table,
  colorScheme: ColorScheme.fromSeed(seedColor: _C.navy, brightness: Brightness.dark, surface: _C.table),
  bottomSheetTheme: const BottomSheetThemeData(backgroundColor: _C.paper, surfaceTintColor: Colors.transparent),
);

const _num = [FontFeature.tabularFigures()];

bool _still(BuildContext context) => MediaQuery.disableAnimationsOf(context);

// ───────────────────────── ホーム ─────────────────────────

class _Home extends StatefulWidget {
  const _Home();

  @override
  State<_Home> createState() => _HomeState();
}

class _HomeState extends State<_Home> {
  void _open(Widget screen) async {
    await Navigator.of(context).push(_fade(screen));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final collected = p.collection.values.fold(0, (a, s) => a + s.length);
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: RadialGradient(center: Alignment(0, -0.35), radius: 1.1, colors: [_C.tableLift, _C.table]),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            children: [
              Row(
                children: [
                  const _Logo(),
                  const Spacer(),
                  IconButton(onPressed: null, icon: Icon(Icons.tune, color: _C.chalkSoft.withValues(alpha: 0.4)), tooltip: '設定（次の round）'),
                ],
              ),
              const SizedBox(height: 12),
              Center(
                child: GestureDetector(
                  onTap: p.dailyDone ? null : () => _open(_Quiz(session: _dailySession())),
                  child: p.dailyDone ? const _OpenedPack() : _Pack(number: p.dailyNumber),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  p.dailyDone ? '今日の1枚は開けました。次は ${_hm(p.untilNext)} 後' : '今日の1枚　答えられるのは 3 回まで',
                  style: const TextStyle(color: _C.chalkSoft, fontSize: 13),
                ),
              ),
              const SizedBox(height: 24),
              _ChunkyButton(
                label: 'パックを開ける',
                caption: '全球団・通算 300 試合以上',
                icon: Icons.style,
                onTap: () => _open(_Quiz(session: _normalSession())),
              ),
              const SizedBox(height: 20),
              _BinderStrip(collected: collected, onTap: () => _open(const _Binder())),
              const SizedBox(height: 16),
              _Week(days: p.weekDays, streak: p.streak, best: p.bestStreak),
            ],
          ),
        ),
      ),
    );
  }
}

QuizSession _normalSession() => QuizSession(player: quizPlayers[DateTime.now().millisecond % quizPlayers.length]);

QuizSession _dailySession() => QuizSession(player: quizPlayers[profile.dailyNumber % quizPlayers.length], mode: QuizMode.daily, seed: profile.dailyNumber);

String _hm(Duration d) => '${d.inHours}時間${d.inMinutes % 60}分';

class _Logo extends StatelessWidget {
  const _Logo();

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const Text('.389', style: TextStyle(color: _C.chalk, fontSize: 34, fontWeight: FontWeight.w700, height: 1, letterSpacing: -1)),
        const SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.only(bottom: 3),
          child: Text('プロ野球クイズ\n2025 SERIES', style: TextStyle(color: _C.chalkSoft.withValues(alpha: 0.9), fontSize: 9, height: 1.3, fontWeight: FontWeight.w700, letterSpacing: 1)),
        ),
      ],
    );
  }
}

/// 封を切る前のパック。ゆっくり揺れて、触れる物だと伝える。
class _Pack extends StatefulWidget {
  const _Pack({required this.number});

  final int number;

  @override
  State<_Pack> createState() => _PackState();
}

class _PackState extends State<_Pack> with SingleTickerProviderStateMixin {
  late final _sway = AnimationController(vsync: this, duration: const Duration(milliseconds: 3200));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_still(context)) {
      _sway.stop();
    } else if (!_sway.isAnimating) {
      _sway.repeat();
    }
  }

  @override
  void dispose() {
    _sway.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _sway,
      builder: (context, child) {
        final t = _sway.value * 2 * math.pi;
        return Transform.translate(
          offset: Offset(0, math.sin(t) * 4),
          child: Transform.rotate(angle: math.sin(t + 0.6) * 0.025, child: child),
        );
      },
      child: SizedBox(
        width: 210,
        height: 290,
        child: CustomPaint(
          painter: _PackPainter(),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(22, 40, 22, 36),
            child: Column(
              children: [
                const Text('今日の1枚', style: TextStyle(color: _C.paper, fontSize: 15, fontWeight: FontWeight.w700, letterSpacing: 2)),
                const Spacer(),
                Text(
                  'No.${widget.number}',
                  style: const TextStyle(color: _C.paper, fontSize: 40, fontWeight: FontWeight.w700, height: 1, fontFeatures: _num),
                ),
                const SizedBox(height: 6),
                const Text('1 PLAYER INSIDE', style: TextStyle(color: _C.gold, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 3)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(color: _C.paper, borderRadius: BorderRadius.circular(99)),
                  child: const Text('タップして開ける', style: TextStyle(color: _C.navy, fontSize: 13, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PackPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const crimp = 14.0;
    final body = Path()..addRRect(RRect.fromRectAndRadius(Rect.fromLTWH(0, crimp, size.width, size.height - crimp * 2), const Radius.circular(6)));
    canvas.drawShadow(body, Colors.black, 10, false);
    // 上下の圧着。ぎざぎざにしてパックだと読ませる。
    for (final top in [true, false]) {
      final y0 = top ? 0.0 : size.height - crimp;
      final zig = Path()..moveTo(0, top ? crimp : y0);
      const teeth = 14;
      for (var i = 0; i <= teeth; i++) {
        final x = size.width * i / teeth;
        zig.lineTo(x, i.isEven ? (top ? 2 : size.height - 2) : (top ? 8 : size.height - 8));
      }
      zig
        ..lineTo(size.width, top ? crimp : y0)
        ..close();
      canvas.drawPath(zig, Paint()..color = const Color(0xFF8E9BA8));
    }
    canvas.save();
    canvas.clipPath(body);
    canvas.drawRect(Offset.zero & size, Paint()..color = _C.navy);
    final stripe = Paint()..color = const Color(0x22FFFFFF);
    for (var x = -size.height; x < size.width; x += 18) {
      canvas.drawPath(
        Path()
          ..moveTo(x, size.height)
          ..lineTo(x + size.height, 0)
          ..lineTo(x + size.height + 7, 0)
          ..lineTo(x + 7, size.height)
          ..close(),
        stripe,
      );
    }
    canvas.drawRect(Rect.fromLTWH(0, size.height * 0.62, size.width, 6), Paint()..color = _C.red);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _OpenedPack extends StatelessWidget {
  const _OpenedPack();

  @override
  Widget build(BuildContext context) {
    final last = profile.records.isEmpty ? null : profile.records.first;
    return SizedBox(
      width: 210,
      height: 290,
      child: last == null
          ? const SizedBox.shrink()
          : Transform.rotate(angle: -0.04, child: _CardFront(player: last.player, rank: last.rank, compact: true)),
    );
  }
}

class _ChunkyButton extends StatefulWidget {
  const _ChunkyButton({required this.label, required this.onTap, this.caption, this.icon, this.color = _C.paper, this.ink = _C.navy});

  final String label;
  final String? caption;
  final IconData? icon;
  final VoidCallback? onTap;
  final Color color;
  final Color ink;

  @override
  State<_ChunkyButton> createState() => _ChunkyButtonState();
}

/// 押すと厚みのぶん沈む。カードを机に押しつける手触りにする。
class _ChunkyButtonState extends State<_ChunkyButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    const depth = 5.0;
    final enabled = widget.onTap != null;
    final color = enabled ? widget.color : widget.color.withValues(alpha: 0.35);
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
        child: SizedBox(
          height: (widget.caption == null ? 56 : 68) + depth,
          child: Stack(
            children: [
              Positioned.fill(
                top: depth,
                child: DecoratedBox(decoration: BoxDecoration(color: Color.lerp(color, Colors.black, 0.45), borderRadius: BorderRadius.circular(14))),
              ),
              AnimatedPositioned(
                duration: const Duration(milliseconds: 70),
                left: 0,
                right: 0,
                top: _down ? depth : 0,
                bottom: _down ? 0 : depth,
                child: DecoratedBox(
                  decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (widget.icon != null) ...[Icon(widget.icon, color: widget.ink, size: 22), const SizedBox(width: 10)],
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.label, style: TextStyle(color: widget.ink, fontSize: 18, fontWeight: FontWeight.w700)),
                          if (widget.caption != null)
                            Text(widget.caption!, style: TextStyle(color: widget.ink.withValues(alpha: 0.65), fontSize: 11)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BinderStrip extends StatelessWidget {
  const _BinderStrip({required this.collected, required this.onTap});

  final int collected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final total = quizPlayers.length;
    return Material(
      color: _C.tableLift,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('あなたの打率', style: TextStyle(color: _C.chalkSoft, fontSize: 11)),
                  Text(profile.average, style: const TextStyle(color: _C.chalk, fontSize: 30, fontWeight: FontWeight.w700, height: 1.1, fontFeatures: _num)),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('バインダー', style: TextStyle(color: _C.chalk, fontSize: 14, fontWeight: FontWeight.w700)),
                        const Spacer(),
                        Text('$collected / $total', style: const TextStyle(color: _C.chalkSoft, fontSize: 12, fontFeatures: _num)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        for (final t in teamOrder) ...[
                          Expanded(child: _TeamTick(filled: profile.collection[t]!.length, size: Profile.teamSize[t]!)),
                          if (t != teamOrder.last) const SizedBox(width: 3),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right, color: _C.chalkSoft),
            ],
          ),
        ),
      ),
    );
  }
}

class _TeamTick extends StatelessWidget {
  const _TeamTick({required this.filled, required this.size});

  final int filled;
  final int size;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 22,
      alignment: Alignment.bottomCenter,
      decoration: BoxDecoration(color: _C.table, borderRadius: BorderRadius.circular(3)),
      child: FractionallySizedBox(
        heightFactor: size == 0 ? 0 : filled / size,
        child: Container(decoration: BoxDecoration(color: _C.gold, borderRadius: BorderRadius.circular(3))),
      ),
    );
  }
}

class _Week extends StatelessWidget {
  const _Week({required this.days, required this.streak, required this.best});

  final Set<int> days;
  final int streak;
  final int best;

  @override
  Widget build(BuildContext context) {
    const labels = ['月', '火', '水', '木', '金', '土', '日'];
    return Row(
      children: [
        for (var i = 0; i < 7; i++) ...[
          Column(
            children: [
              Text(labels[i], style: const TextStyle(color: _C.chalkSoft, fontSize: 10)),
              const SizedBox(height: 4),
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: days.contains(i) ? _C.red : Colors.transparent,
                  border: Border.all(color: i == Profile.today ? _C.chalk : _C.chalkSoft.withValues(alpha: 0.4), width: 1.5),
                ),
                child: days.contains(i) ? const Icon(Icons.check, size: 13, color: _C.paper) : null,
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
        const Spacer(),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('$streak日連続', style: const TextStyle(color: _C.chalk, fontSize: 15, fontWeight: FontWeight.w700)),
            Text('最長 $best日', style: const TextStyle(color: _C.chalkSoft, fontSize: 11)),
          ],
        ),
      ],
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

class _QuizState extends State<_Quiz> with TickerProviderStateMixin {
  QuizSession get s => widget.session;
  late final _shake = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
  late final _stamp = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100));

  @override
  void initState() {
    super.initState();
    s.addListener(_changed);
    if (widget.openAnswer) WidgetsBinding.instance.addPostFrameCallback((_) => _answer());
  }

  @override
  void dispose() {
    s.removeListener(_changed);
    _shake.dispose();
    _stamp.dispose();
    super.dispose();
  }

  void _changed() => setState(() {});

  Future<void> _answer() async {
    final name = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _AnswerSheet(wrong: s.wrongNames),
    );
    if (name == null || !mounted) return;
    final outcome = s.guess(name);
    if (outcome == GuessOutcome.wrong) {
      if (!_still(context)) {
        _shake.forward(from: 0);
        _stamp.forward(from: 0);
      }
      return;
    }
    await Future<void>.delayed(const Duration(milliseconds: 120));
    if (mounted) Navigator.of(context).pushReplacement(_fade(_Result(session: s)));
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
                leading: const Icon(Icons.grid_on, color: _C.ink),
                title: const Text('全部開ける', style: TextStyle(color: _C.ink)),
                subtitle: const Text('当ててもノーマルになります', style: TextStyle(color: _C.inkSoft)),
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
      Navigator.of(context).pushReplacement(_fade(_Result(session: s)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final daily = s.mode == QuizMode.daily;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
              child: Row(
                children: [
                  IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.chalk), tooltip: '閉じる'),
                  Text(daily ? '今日の1枚 No.${profile.dailyNumber}' : 'パック', style: const TextStyle(color: _C.chalk, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  if (daily) _Lives(left: s.livesLeft),
                  IconButton(onPressed: _menu, icon: const Icon(Icons.more_horiz, color: _C.chalk), tooltip: 'そのほか'),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                child: AnimatedBuilder(
                  animation: Listenable.merge([_shake, _stamp]),
                  builder: (context, child) {
                    final dx = math.sin(_shake.value * math.pi * 5) * 10 * (1 - _shake.value);
                    return Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Transform.translate(offset: Offset(dx, 0), child: child),
                        if (_stamp.isAnimating) Positioned.fill(child: _MissStamp(t: _stamp.value)),
                      ],
                    );
                  },
                  child: _CardBack(session: s),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: _RarityMeter(session: s),
            ),
            if (s.wrongNames.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: SizedBox(
                  width: double.infinity,
                  child: Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      for (final n in s.wrongNames)
                        Text(
                          n,
                          style: TextStyle(color: _C.red.withValues(alpha: 0.9), fontSize: 12, decoration: TextDecoration.lineThrough, decorationColor: _C.red),
                        ),
                    ],
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: _ChunkyButton(
                      label: s.unveil >= s.total ? '全部開いた' : '1マス開ける',
                      icon: Icons.touch_app,
                      color: _C.navy,
                      ink: _C.paper,
                      onTap: s.unveil >= s.total ? null : s.revealNext,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 4,
                    child: _ChunkyButton(label: '答える', icon: Icons.edit, color: _C.gold, ink: _C.ink, onTap: _answer),
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

class _Lives extends StatelessWidget {
  const _Lives({required this.left});

  final int left;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '残り $left 回',
      child: Row(
        children: [
          for (var i = 0; i < QuizSession.dailyLives; i++)
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 18,
              height: 18,
              margin: const EdgeInsets.only(left: 4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i < left ? _C.paper : Colors.transparent,
                border: Border.all(color: i < left ? _C.paper : _C.chalkSoft.withValues(alpha: 0.4), width: 1.5),
              ),
              child: i < left ? const CustomPaint(painter: _SeamPainter()) : Icon(Icons.close, size: 12, color: _C.chalkSoft.withValues(alpha: 0.6)),
            ),
        ],
      ),
    );
  }
}

/// ボールの縫い目。
class _SeamPainter extends CustomPainter {
  const _SeamPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = _C.red
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    final r = size.width / 2;
    canvas.drawArc(Rect.fromCircle(center: Offset(-r * 0.35, r), radius: r * 0.95), -0.9, 1.8, false, p);
    canvas.drawArc(Rect.fromCircle(center: Offset(size.width + r * 0.35, r), radius: r * 0.95), math.pi - 0.9, 1.8, false, p);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MissStamp extends StatelessWidget {
  const _MissStamp({required this.t});

  final double t;

  @override
  Widget build(BuildContext context) {
    final inT = Curves.easeOutBack.transform((t / 0.25).clamp(0, 1));
    final out = t < 0.7 ? 1.0 : 1 - (t - 0.7) / 0.3;
    return IgnorePointer(
      child: Center(
        child: Opacity(
          opacity: out.clamp(0, 1),
          child: Transform.scale(
            scale: 1.8 - 0.8 * inT,
            child: Transform.rotate(
              angle: -0.2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                decoration: BoxDecoration(border: Border.all(color: _C.red, width: 4), borderRadius: BorderRadius.circular(8)),
                child: const Text('ちがう', style: TextStyle(color: _C.red, fontSize: 44, fontWeight: FontWeight.w700, letterSpacing: 6)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// カードの裏面。年度 × 項目の表を 2 色刷りで印刷し、伏せたマスは網点で埋める。
class _CardBack extends StatelessWidget {
  const _CardBack({required this.session});

  final QuizSession session;

  @override
  Widget build(BuildContext context) {
    final s = session;
    return Container(
      decoration: BoxDecoration(
        color: _C.paper,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x66000000), blurRadius: 18, offset: Offset(0, 8))],
      ),
      padding: const EdgeInsets.all(8),
      child: Container(
        decoration: BoxDecoration(border: Border.all(color: _C.navy, width: 2), borderRadius: BorderRadius.circular(10)),
        child: Column(
          children: [
            Container(
              color: _C.navy,
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(color: _C.paper, shape: BoxShape.circle),
                    child: const Text('?', style: TextStyle(color: _C.navy, fontSize: 20, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('この選手はだれ？', style: TextStyle(color: _C.paper, fontSize: 15, fontWeight: FontWeight.w700)),
                      Text('年度別打撃成績　2025年シーズン終了時', style: TextStyle(color: Color(0xFFB9C6D8), fontSize: 9.5)),
                    ],
                  ),
                  const Spacer(),
                  Text('${s.yearCount}年', style: const TextStyle(color: _C.gold, fontSize: 13, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 2),
              child: _row(
                ['年度', ...s.stats].map((h) => Text(h, textAlign: TextAlign.center, style: const TextStyle(color: _C.navy, fontSize: 11, fontWeight: FontWeight.w700))).toList(),
              ),
            ),
            Container(height: 1.5, margin: const EdgeInsets.symmetric(horizontal: 8), color: _C.navy),
            Expanded(
              child: LayoutBuilder(
                builder: (context, box) {
                  final rowH = (box.maxHeight / s.yearCount).clamp(18.0, 30.0);
                  return SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Column(
                      children: [
                        for (var r = 0; r < s.yearCount; r++)
                          Container(
                            height: rowH,
                            color: r.isOdd ? _C.paperShade : null,
                            child: _row([
                              Text(s.year(r), textAlign: TextAlign.center, style: const TextStyle(color: _C.inkSoft, fontSize: 12, fontFeatures: _num)),
                              for (var c = 0; c < s.stats.length; c++)
                                _Cell(text: s.value(r, c), revealed: s.isRevealed(r, c), fresh: s.lastRevealed == (r, c)),
                            ]),
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 6),
              child: Row(
                children: [
                  Text('開示 ${s.unveil} / ${s.total}', style: const TextStyle(color: _C.inkSoft, fontSize: 10, fontFeatures: _num)),
                  const Spacer(),
                  const Text('.389 TRADING CARDS', style: TextStyle(color: _C.inkSoft, fontSize: 8, letterSpacing: 2)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(List<Widget> cells) => Row(
    children: [
      for (var i = 0; i < cells.length; i++) Expanded(flex: i == 0 ? 4 : 5, child: cells[i]),
    ],
  );
}

/// 1 マス。開いた瞬間だけ、インクを押した輪を広げる。
class _Cell extends StatefulWidget {
  const _Cell({required this.text, required this.revealed, required this.fresh});

  final String text;
  final bool revealed;
  final bool fresh;

  @override
  State<_Cell> createState() => _CellState();
}

class _CellState extends State<_Cell> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 320), value: 1);

  @override
  void didUpdateWidget(_Cell old) {
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
    if (!widget.revealed) {
      return const Padding(padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4), child: CustomPaint(painter: _HalftonePainter(), child: SizedBox.expand()));
    }
    return AnimatedBuilder(
      animation: _t,
      builder: (context, _) {
        final v = _t.value;
        final pop = Curves.easeOutBack.transform((v / 0.7).clamp(0, 1));
        return Stack(
          alignment: Alignment.center,
          children: [
            if (v < 1)
              CustomPaint(
                painter: _RingPainter(progress: v),
                child: const SizedBox.expand(),
              ),
            Opacity(
              opacity: (v / 0.3).clamp(0, 1),
              child: Transform.scale(
                scale: 1.5 - 0.5 * pop,
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    widget.text,
                    maxLines: 1,
                    style: TextStyle(color: widget.fresh ? _C.red : _C.ink, fontSize: 14, fontWeight: FontWeight.w700, fontFeatures: _num),
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

class _HalftonePainter extends CustomPainter {
  const _HalftonePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = _C.navy.withValues(alpha: 0.22);
    const step = 4.0;
    canvas.clipRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(3)));
    for (var y = step / 2; y < size.height; y += step) {
      final shift = ((y / step).floor().isOdd) ? step / 2 : 0;
      for (var x = step / 2 + shift; x < size.width; x += step) {
        canvas.drawCircle(Offset(x, y), 1.05, p);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.progress});

  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final t = Curves.easeOut.transform(progress);
    canvas.drawCircle(
      size.center(Offset.zero),
      6 + t * size.width * 0.45,
      Paint()
        ..color = _C.red.withValues(alpha: (1 - t) * 0.6)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5 * (1 - t) + 0.5,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) => old.progress != progress;
}

/// レア度の目盛り。開示の割合の帯（SS 10%、S 20%、A 50%、B 70%）を幅で描き、いまの位置を針で指す。
/// 誤答でもランクは落ちるので、ラベルは rankNow から出す。
class _RarityMeter extends StatefulWidget {
  const _RarityMeter({required this.session});

  final QuizSession session;

  @override
  State<_RarityMeter> createState() => _RarityMeterState();
}

class _RarityMeterState extends State<_RarityMeter> with SingleTickerProviderStateMixin {
  late final _drop = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
  late Rank _last = widget.session.rankNow;

  @override
  void didUpdateWidget(_RarityMeter old) {
    super.didUpdateWidget(old);
    final now = widget.session.rankNow;
    if (now != _last) {
      _last = now;
      if (!_still(context)) _drop.forward(from: 0);
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
    const zones = [(Rank.ss, 0.1), (Rank.s, 0.1), (Rank.a, 0.3), (Rank.b, 0.2), (Rank.c, 0.3)];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            const Text('いま当てれば', style: TextStyle(color: _C.chalkSoft, fontSize: 12)),
            const SizedBox(width: 6),
            AnimatedBuilder(
              animation: _drop,
              builder: (context, child) => Transform.scale(scale: 1 + math.sin(_drop.value * math.pi) * 0.25, child: child),
              child: Text(
                '${now.label} ${_rarityName(now)}',
                style: TextStyle(color: _rarity(now), fontSize: 18, fontWeight: FontWeight.w700, height: 1),
              ),
            ),
            const Spacer(),
            Text(
              left == null ? 'これ以上は下がらない' : (left <= 0 ? '次の 1 マスで下がる' : 'あと $left マスで下がる'),
              style: TextStyle(color: left != null && left <= 0 ? _C.red : _C.chalkSoft, fontSize: 12),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, box) {
            final w = box.maxWidth;
            final x = (s.rate * w).clamp(0.0, w);
            return SizedBox(
              height: 34,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Row(
                    children: [
                      for (final (r, f) in zones)
                        Expanded(
                          flex: (f * 100).round(),
                          child: Container(
                            height: 12,
                            margin: const EdgeInsets.only(right: 2),
                            decoration: BoxDecoration(
                              color: r == now ? _rarity(r) : _rarity(r).withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        ),
                    ],
                  ),
                  Positioned(left: 0, top: 0, width: x, height: 12, child: Container(decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.45), borderRadius: BorderRadius.circular(3)))),
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    left: x - 5,
                    top: 12,
                    child: const Icon(Icons.arrow_drop_up, size: 14, color: _C.chalk),
                  ),
                  Positioned(
                    left: 0,
                    right: 0,
                    top: 22,
                    child: Row(
                      children: [
                        for (final (r, f) in zones)
                          Expanded(
                            flex: (f * 100).round(),
                            child: Text(r.label, style: TextStyle(color: _rarity(r).withValues(alpha: r == now ? 1 : 0.6), fontSize: 9, fontWeight: FontWeight.w700)),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
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
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('この選手はだれ？', style: TextStyle(color: _C.ink, fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              TextField(
                controller: _text,
                autofocus: true,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(color: _C.ink, fontSize: 17),
                decoration: InputDecoration(
                  hintText: '名前の一部（例: 柳田）',
                  hintStyle: const TextStyle(color: _C.inkSoft),
                  prefixIcon: const Icon(Icons.search, color: _C.inkSoft),
                  filled: true,
                  fillColor: _C.paperShade,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 264,
                child: hits.isEmpty
                    ? Center(
                        child: Text(
                          _text.text.isEmpty ? '名前を入れると候補が出ます' : '該当する選手がいません',
                          style: const TextStyle(color: _C.inkSoft),
                        ),
                      )
                    : ListView(
                        children: [
                          for (final n in hits)
                            ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                              enabled: !widget.wrong.contains(n),
                              title: Text(
                                n,
                                style: TextStyle(
                                  color: widget.wrong.contains(n) ? _C.inkSoft : _C.ink,
                                  fontWeight: FontWeight.w700,
                                  decoration: widget.wrong.contains(n) ? TextDecoration.lineThrough : null,
                                ),
                              ),
                              trailing: widget.wrong.contains(n) ? const Text('外れ', style: TextStyle(color: _C.red, fontSize: 12)) : const Icon(Icons.arrow_forward, color: _C.navy),
                              onTap: () => Navigator.pop(context, n),
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

// ───────────────────────── 結果 ─────────────────────────

class _Result extends StatefulWidget {
  const _Result({required this.session});

  final QuizSession session;

  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> with SingleTickerProviderStateMixin {
  late final _flip = AnimationController(vsync: this, duration: const Duration(milliseconds: 620));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_still(context)) {
      _flip.value = 1;
    } else if (_flip.value == 0 && !_flip.isAnimating) {
      Future<void>.delayed(const Duration(milliseconds: 260), () {
        if (mounted) _flip.forward();
      });
    }
  }

  @override
  void dispose() {
    _flip.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final rank = s.finalRank;
    final won = s.status == QuizStatus.correct;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.chalk), tooltip: '閉じる'),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 63 / 88,
                    child: AnimatedBuilder(
                      animation: _flip,
                      builder: (context, _) {
                        final t = Curves.easeInOutCubic.transform(_flip.value);
                        final angle = t * math.pi;
                        final front = angle > math.pi / 2;
                        // 返る途中で少し持ち上げ、机から離れる感じを出す。
                        final lift = math.sin(t * math.pi) * 0.08;
                        return Transform(
                          alignment: Alignment.center,
                          transform: Matrix4.identity()
                            ..setEntry(3, 2, 0.0012)
                            ..scaleByDouble(1 + lift, 1 + lift, 1, 1)
                            ..rotateY(angle),
                          child: front
                              ? Transform(alignment: Alignment.center, transform: Matrix4.rotationY(math.pi), child: _CardFront(player: s.player, rank: rank))
                              : _CardBack(session: s),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FadeTransition(
              opacity: CurvedAnimation(parent: _flip, curve: const Interval(0.6, 1)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    Text(
                      won ? _praise(rank) : '正解は ${s.player.name} でした',
                      style: const TextStyle(color: _C.chalk, fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '開示 ${s.unveil}/${s.total}（${(s.rate * 100).round()}%）・外れ ${s.incorrect} 回',
                      style: const TextStyle(color: _C.chalkSoft, fontSize: 13, fontFeatures: _num),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          flex: 5,
                          child: _ChunkyButton(
                            label: s.mode == QuizMode.daily ? 'パックを開ける' : '次のパック',
                            icon: Icons.style,
                            color: _C.navy,
                            ink: _C.paper,
                            onTap: () => Navigator.of(context).pushReplacement(_fade(_Quiz(session: _normalSession()))),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          flex: 3,
                          child: _ChunkyButton(label: '見せる', icon: Icons.ios_share, onTap: () => _share(context)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _share(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => const SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text('製品では、表のカードを画像にして OS の共有シートを開く。試作では開かない。', style: TextStyle(color: _C.ink)),
        ),
      ),
    );
  }
}

String _praise(Rank r) => switch (r) {
  Rank.ss => 'ほぼ伏せたまま当てた。ホロを引きました',
  Rank.s => '少ない手がかりで当てました',
  Rank.a => '正解。シルバーで収めました',
  Rank.b => '正解。ブロンズで収めました',
  _ => '正解。バインダーに収めました',
};

/// カードの表。枠の色でレア度を伝え、SS は光の帯を流す。
class _CardFront extends StatefulWidget {
  const _CardFront({required this.player, required this.rank, this.compact = false});

  final QuizPlayer player;
  final Rank rank;
  final bool compact;

  @override
  State<_CardFront> createState() => _CardFrontState();
}

class _CardFrontState extends State<_CardFront> with SingleTickerProviderStateMixin {
  late final _shine = AnimationController(vsync: this, duration: const Duration(milliseconds: 2400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final holo = widget.rank == Rank.ss || widget.rank == Rank.s;
    if (holo && !_still(context) && !_shine.isAnimating) _shine.repeat();
  }

  @override
  void dispose() {
    _shine.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.player;
    final rank = widget.rank;
    final frame = _rarity(rank);
    final team = teamShort[p.team] ?? p.team;
    final given = p.name.split(' ').skip(1).join(' ');
    final scale = widget.compact ? 0.62 : 1.0;
    final miss = rank == Rank.miss;
    return AnimatedBuilder(
      animation: _shine,
      builder: (context, child) {
        final holo = rank == Rank.ss;
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16 * scale),
            gradient: holo
                ? SweepGradient(
                    transform: GradientRotation(_shine.value * 2 * math.pi),
                    colors: const [Color(0xFF7FE3F0), Color(0xFFE59BF2), Color(0xFFFFE27A), Color(0xFF9CF2B8), Color(0xFF7FE3F0)],
                  )
                : null,
            color: holo ? null : frame,
            boxShadow: const [BoxShadow(color: Color(0x66000000), blurRadius: 18, offset: Offset(0, 8))],
          ),
          padding: EdgeInsets.all(10 * scale),
          child: child,
        );
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8 * scale),
        child: Stack(
          children: [
            Positioned.fill(child: Container(color: miss ? const Color(0xFFD9D4CB) : _C.paper)),
            Positioned.fill(child: CustomPaint(painter: _RaysPainter(color: miss ? Colors.black12 : _C.navy.withValues(alpha: 0.08)))),
            Positioned(
              left: 0,
              right: 0,
              top: 70 * scale,
              child: Column(
                children: [
                  Text('通算本塁打', style: TextStyle(color: _C.inkSoft, fontSize: 11 * scale, fontWeight: FontWeight.w700, letterSpacing: 2)),
                  Text(
                    '${_career(p, '本塁打')}',
                    style: TextStyle(color: miss ? const Color(0xFF8A8A8A) : _C.navy, fontSize: 92 * scale, fontWeight: FontWeight.w700, height: 1, letterSpacing: -2, fontFeatures: _num),
                  ),
                  Text('${_career(p, '安打')} 安打', style: TextStyle(color: _C.inkSoft, fontSize: 13 * scale, fontWeight: FontWeight.w700, fontFeatures: _num)),
                ],
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                color: miss ? const Color(0xFF6E6E6E) : _C.navy,
                padding: EdgeInsets.fromLTRB(14 * scale, 10 * scale, 14 * scale, 12 * scale),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.family,
                      style: TextStyle(color: _C.paper, fontSize: 46 * scale, fontWeight: FontWeight.w700, height: 1, letterSpacing: 2),
                    ),
                    SizedBox(height: 4 * scale),
                    Text(given, style: TextStyle(color: _C.paper.withValues(alpha: 0.85), fontSize: 18 * scale, fontWeight: FontWeight.w700)),
                    SizedBox(height: 6 * scale),
                    Text('$team・在籍 ${p.rows.length} 年', style: TextStyle(color: const Color(0xFFB9C6D8), fontSize: 11 * scale)),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 10 * scale,
              left: 10 * scale,
              child: Container(
                width: 52 * scale,
                height: 52 * scale,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: miss ? const Color(0xFF6E6E6E) : _C.ink, shape: BoxShape.circle, border: Border.all(color: frame, width: 3 * scale)),
                child: Text(rank.label, style: TextStyle(color: frame, fontSize: 20 * scale, fontWeight: FontWeight.w700)),
              ),
            ),
            Positioned(
              top: 14 * scale,
              right: 12 * scale,
              child: Text(miss ? '' : _rarityName(rank).toUpperCase(), style: TextStyle(color: _C.inkSoft, fontSize: 10 * scale, letterSpacing: 2, fontWeight: FontWeight.w700)),
            ),
            if (miss)
              Center(
                child: Transform.rotate(
                  angle: -0.25,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(border: Border.all(color: _C.red, width: 3), borderRadius: BorderRadius.circular(6)),
                    child: Text('MISS', style: TextStyle(color: _C.red, fontSize: 34 * scale, fontWeight: FontWeight.w700, letterSpacing: 4)),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

int _career(QuizPlayer p, String stat) {
  final i = statColumns.indexOf(stat) + 1;
  return p.rows.fold(0, (sum, r) => sum + (int.tryParse(r[i]) ?? 0));
}

class _RaysPainter extends CustomPainter {
  _RaysPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width * 0.5, size.height * 0.38);
    final p = Paint()..color = color;
    const n = 18;
    for (var i = 0; i < n; i++) {
      final a = i * 2 * math.pi / n;
      final path = Path()
        ..moveTo(c.dx, c.dy)
        ..lineTo(c.dx + math.cos(a) * size.height, c.dy + math.sin(a) * size.height)
        ..lineTo(c.dx + math.cos(a + 0.09) * size.height, c.dy + math.sin(a + 0.09) * size.height)
        ..close();
      canvas.drawPath(path, p);
    }
  }

  @override
  bool shouldRepaint(covariant _RaysPainter old) => old.color != color;
}

// ───────────────────────── バインダー（マイ成績） ─────────────────────────

class _Binder extends StatelessWidget {
  const _Binder();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final collection = p.collection;
    final best = <String, Rank>{};
    for (final r in p.records.reversed.where((e) => e.correct)) {
      final prev = best[r.player.name];
      if (prev == null || r.rank.index < prev.index) best[r.player.name] = r.rank;
    }
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 4, 20, 0),
                child: Row(
                  children: [
                    IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back, color: _C.chalk), tooltip: '戻る'),
                    const Text('バインダー', style: TextStyle(color: _C.chalk, fontSize: 17, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('あなたの打率', style: TextStyle(color: _C.chalkSoft, fontSize: 12)),
                        Text(p.average, style: const TextStyle(color: _C.chalk, fontSize: 56, fontWeight: FontWeight.w700, height: 1, fontFeatures: _num)),
                        const SizedBox(height: 4),
                        Text('${p.plays} 打数 ${p.correct} 安打', style: const TextStyle(color: _C.chalkSoft, fontSize: 12, fontFeatures: _num)),
                      ],
                    ),
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        for (final r in const [Rank.ss, Rank.s, Rank.a, Rank.b, Rank.c])
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 10, height: 14, decoration: BoxDecoration(color: _rarity(r), borderRadius: BorderRadius.circular(2))),
                                const SizedBox(width: 6),
                                SizedBox(width: 22, child: Text(r.label, style: const TextStyle(color: _C.chalkSoft, fontSize: 11))),
                                SizedBox(width: 22, child: Text('${p.count(r)}', textAlign: TextAlign.right, style: const TextStyle(color: _C.chalk, fontSize: 12, fontWeight: FontWeight.w700, fontFeatures: _num))),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            for (final t in teamOrder)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(t, style: const TextStyle(color: _C.chalk, fontSize: 14, fontWeight: FontWeight.w700)),
                          const SizedBox(width: 8),
                          Text('${collection[t]!.length} / ${Profile.teamSize[t]}', style: const TextStyle(color: _C.chalkSoft, fontSize: 12, fontFeatures: _num)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final pl in quizPlayers.where((e) => teamShort[e.team] == t))
                            _Pocket(player: pl, rank: best[pl.name]),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

/// バインダーのポケット。集めた選手はレア度の枠のミニカード、未収集は点線の空き。
class _Pocket extends StatelessWidget {
  const _Pocket({required this.player, required this.rank});

  final QuizPlayer player;
  final Rank? rank;

  @override
  Widget build(BuildContext context) {
    const w = 64.0;
    const h = w * 88 / 63;
    final r = rank;
    if (r == null) {
      return Semantics(
        label: '未収集',
        child: CustomPaint(
          painter: _DashedPainter(),
          child: const SizedBox(width: w, height: h, child: Center(child: Text('?', style: TextStyle(color: _C.chalkSoft, fontSize: 18)))),
        ),
      );
    }
    return Container(
      width: w,
      height: h,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(color: _rarity(r), borderRadius: BorderRadius.circular(6)),
      child: Container(
        decoration: BoxDecoration(color: _C.paper, borderRadius: BorderRadius.circular(3)),
        alignment: Alignment.bottomLeft,
        padding: const EdgeInsets.all(4),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(r.label, style: TextStyle(color: Color.lerp(_rarity(r), Colors.black, 0.35), fontSize: 10, fontWeight: FontWeight.w700)),
            Text(player.family, maxLines: 1, overflow: TextOverflow.clip, style: const TextStyle(color: _C.ink, fontSize: 12, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _DashedPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = _C.chalkSoft.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    final path = Path()..addRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(6)));
    for (final m in path.computeMetrics()) {
      for (var d = 0.0; d < m.length; d += 7) {
        canvas.drawPath(m.extractPath(d, d + 4), p);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

PageRoute<void> _fade(Widget screen) => PageRouteBuilder<void>(
  transitionDuration: const Duration(milliseconds: 260),
  pageBuilder: (_, _, _) => screen,
  transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: CurvedAnimation(parent: a, curve: Curves.easeOut), child: child),
);
