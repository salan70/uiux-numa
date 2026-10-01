import 'dart:async';
import 'dart:collection';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/data.dart';
import '../../shared/profile.dart';

// splitflap: 伏せた成績表を、駅や空港の発車標（パタパタ）に見立てる。
// 全画面を 1 枚の盤で描き、ホームは「本日の案内」の時刻表、クイズは成績の盤、結果は判定の盤にする。画面が変わるのでなく、盤の文字が入れ替わる。
// 1 文字ずつの札が回って止まる動きを、開示、正解、画面の切り替えのすべてに使い、動きの語彙を 1 つに絞る。
// 製品のタイマーモードを、盤が一定の間隔で自分から回る「自動」として前に出す。
// 色は盤の黒、札の白、案内の琥珀だけにし、正誤だけを赤と緑で示す。

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
    'stats': (_) => const _Arrivals(),
  },
);

Widget buildPanel() => const JumpPanel();

QuizSession _wrongSession(QuizSession s) {
  s.guess(s.player.name == '山田 哲人' ? '坂本 勇人' : '山田 哲人');
  return s;
}

/// 盤は暗い場所でも明るい場所でも同じ物なので、端末の明暗に関わらず同じ配色にする。
abstract final class _C {
  static const housing = Color(0xFF0B0C0E);
  static const panel = Color(0xFF141518);
  static const flapTop = Color(0xFF23252A);
  static const flapBottom = Color(0xFF1C1E22);
  static const char = Color(0xFFF1EDE3);
  static const dim = Color(0xFF5B5F68);
  static const label = Color(0xFF8F949C);
  static const amber = Color(0xFFFFB21A);
  static const red = Color(0xFFFF5A47);
  static const green = Color(0xFF48D597);
}

Color _rankColor(Rank r) => switch (r) {
  Rank.ss => _C.amber,
  Rank.s => _C.green,
  Rank.a => _C.char,
  Rank.b => _C.char,
  Rank.c => _C.label,
  Rank.miss => _C.red,
};

final _theme = ThemeData(
  useMaterial3: true,
  fontFamily: 'LINE Seed JP',
  scaffoldBackgroundColor: _C.housing,
  colorScheme: ColorScheme.fromSeed(seedColor: _C.amber, brightness: Brightness.dark, surface: _C.panel),
  bottomSheetTheme: const BottomSheetThemeData(backgroundColor: _C.panel, surfaceTintColor: Colors.transparent),
);

bool _still(BuildContext context) => MediaQuery.disableAnimationsOf(context);

const _digits = '0123456789';
const _kana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
final _random = math.Random(7);

/// 盤で使う球団の 1〜2 文字。NPB の速報盤で使われる略し方に倣う。
String _abbr(String team) => switch (team) {
  '巨人' => '巨',
  '阪神' => '神',
  '中日' => '中',
  '広島' => '広',
  'DeNA' => 'De',
  '横浜' => '横',
  'ヤクルト' => 'ヤ',
  'オリックス' => 'オ',
  'ソフトバンク' => 'ソ',
  '西武' => '西',
  '楽天' => '楽',
  'ロッテ' => 'ロ',
  '日本ハム' => '日',
  _ => team.isEmpty ? '' : team.substring(0, 1),
};

// ───────────────────────── 札 ─────────────────────────

/// 1 文字の札。文字が変わると、上半分が倒れて下半分が起きる動きを数回くり返してから止まる。
class _Flap extends StatefulWidget {
  const _Flap(this.char, {this.w = 20, this.h = 26, this.size = 16, this.color = _C.char, this.delay, this.spins = 4});

  final String char;
  final double w;
  final double h;
  final double size;
  final Color color;

  /// 置かれたときに空から回して出すまでの待ち。null なら置いた時点で止まった状態にする。
  final Duration? delay;

  /// 止まるまでに挟む文字の数。
  final int spins;

  @override
  State<_Flap> createState() => _FlapState();
}

class _FlapState extends State<_Flap> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(milliseconds: 64));
  late String _prev;
  late String _next;
  final _queue = Queue<String>();
  Timer? _wait;

  @override
  void initState() {
    super.initState();
    final cascade = widget.delay != null;
    _prev = _next = cascade ? '' : widget.char;
    _t.addStatusListener((s) {
      if (s != AnimationStatus.completed) return;
      _prev = _next;
      if (_queue.isEmpty) return;
      setState(() => _next = _queue.removeFirst());
      _t.forward(from: 0);
    });
    if (cascade) _wait = Timer(widget.delay!, () => _spinTo(widget.char));
  }

  @override
  void didUpdateWidget(_Flap old) {
    super.didUpdateWidget(old);
    if (old.char != widget.char) _spinTo(widget.char);
  }

  void _spinTo(String target) {
    if (!mounted) return;
    if (_still(context) || target == _next && _queue.isEmpty) {
      _queue.clear();
      setState(() => _prev = _next = target);
      return;
    }
    final pool = target.isNotEmpty && '$_digits.'.contains(target) ? _digits : _kana;
    _queue
      ..clear()
      ..addAll([for (var i = 0; i < widget.spins; i++) pool[_random.nextInt(pool.length)], target]);
    if (!_t.isAnimating) {
      setState(() => _next = _queue.removeFirst());
      _t.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _wait?.cancel();
    _t.dispose();
    super.dispose();
  }

  Widget _half(String c, {required bool top, Color? shade}) {
    return ClipRect(
      child: Align(
        alignment: top ? Alignment.topCenter : Alignment.bottomCenter,
        heightFactor: 0.5,
        child: Container(
          width: widget.w,
          height: widget.h,
          decoration: BoxDecoration(
            color: Color.lerp(top ? _C.flapTop : _C.flapBottom, Colors.black, shade == null ? 0 : 0.35),
            borderRadius: BorderRadius.circular(3),
          ),
          alignment: Alignment.center,
          child: Text(
            c,
            style: TextStyle(color: widget.color, fontSize: widget.size, fontWeight: FontWeight.w700, height: 1),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.w,
      height: widget.h,
      child: AnimatedBuilder(
        animation: _t,
        builder: (context, _) {
          final v = _t.value;
          final moving = _t.isAnimating;
          return Stack(
            children: [
              Column(children: [_half(moving ? _next : _prev, top: true), _half(moving ? _prev : _next, top: false)]),
              if (moving && v < 0.5)
                Positioned(
                  top: 0,
                  child: Transform(
                    alignment: Alignment.bottomCenter,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.006)
                      ..rotateX(-v * math.pi),
                    child: _half(_prev, top: true, shade: Colors.black),
                  ),
                ),
              if (moving && v >= 0.5)
                Positioned(
                  bottom: 0,
                  child: Transform(
                    alignment: Alignment.topCenter,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.006)
                      ..rotateX((1 - v) * math.pi),
                    child: _half(_next, top: false, shade: Colors.black),
                  ),
                ),
              Positioned(left: 0, right: 0, top: widget.h / 2 - 0.5, child: Container(height: 1, color: Colors.black)),
            ],
          );
        },
      ),
    );
  }
}

/// 文字列を札の列で描く。cells に満たないぶんは左に空の札を置き、右に揃える。
class _FlapRow extends StatelessWidget {
  const _FlapRow(this.text, {required this.cells, this.w = 20, this.h = 26, this.size = 16, this.color = _C.char, this.delay, this.left = false, this.gap = 2});

  final String text;
  final int cells;
  final double w;
  final double h;
  final double size;
  final Color color;
  final Duration? delay;
  final bool left;
  final double gap;

  @override
  Widget build(BuildContext context) {
    final chars = text.split('');
    final pad = math.max(0, cells - chars.length);
    final all = left ? [...chars, for (var i = 0; i < pad; i++) ''] : [for (var i = 0; i < pad; i++) '', ...chars];
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < math.min(all.length, cells); i++) ...[
          if (i > 0) SizedBox(width: gap),
          _Flap(all[i], w: w, h: h, size: size, color: color, delay: delay == null ? null : delay! + Duration(milliseconds: 28 * i), spins: 3 + i % 3),
        ],
      ],
    );
  }
}

/// 盤の筐体。ねじと、案内の文字を刷った帯を持つ。
class _Board extends StatelessWidget {
  const _Board({required this.child, this.title, this.trailing});

  final Widget child;
  final String? title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _C.panel,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF26282D)),
        boxShadow: const [BoxShadow(color: Colors.black, blurRadius: 0, spreadRadius: 1)],
      ),
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const _Rivet(),
                  const SizedBox(width: 8),
                  Text(title!, style: const TextStyle(color: _C.amber, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 2)),
                  const Spacer(),
                  ?trailing,
                  const SizedBox(width: 8),
                  const _Rivet(),
                ],
              ),
            ),
          child,
        ],
      ),
    );
  }
}

class _Rivet extends StatelessWidget {
  const _Rivet();

  @override
  Widget build(BuildContext context) => Container(
    width: 6,
    height: 6,
    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF34373D)),
  );
}

class _Lamp extends StatelessWidget {
  const _Lamp({required this.on, this.color = _C.amber, this.size = 10});

  final bool on;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: on ? color : const Color(0xFF2A2C31),
        boxShadow: on ? [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 8)] : null,
      ),
    );
  }
}

/// 盤の下の物理的なボタン。押すと 2px 沈む。
class _Key extends StatefulWidget {
  const _Key({required this.label, required this.onTap, this.color = _C.char, this.ink = _C.housing, this.sub});

  final String label;
  final String? sub;
  final VoidCallback? onTap;
  final Color color;
  final Color ink;

  @override
  State<_Key> createState() => _KeyState();
}

class _KeyState extends State<_Key> {
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
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 60),
          height: 58,
          margin: EdgeInsets.only(top: _down ? 3 : 0, bottom: _down ? 0 : 3),
          decoration: BoxDecoration(
            color: enabled ? widget.color : const Color(0xFF2A2C31),
            borderRadius: BorderRadius.circular(8),
            boxShadow: _down ? null : [BoxShadow(color: Color.lerp(widget.color, Colors.black, 0.6)!, offset: const Offset(0, 3))],
          ),
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(widget.label, style: TextStyle(color: enabled ? widget.ink : _C.dim, fontSize: 17, fontWeight: FontWeight.w700)),
              if (widget.sub != null) Text(widget.sub!, style: TextStyle(color: (enabled ? widget.ink : _C.dim).withValues(alpha: 0.7), fontSize: 10)),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── ホーム（本日の案内） ─────────────────────────

class _Home extends StatefulWidget {
  const _Home();

  @override
  State<_Home> createState() => _HomeState();
}

class _HomeState extends State<_Home> {
  int _generation = 0;

  Future<void> _go(Widget screen) async {
    await Navigator.of(context).push(_cut(screen));
    // 戻ったら盤を空から回し直し、案内に戻ったことを伝える。
    setState(() => _generation++);
  }

  @override
  Widget build(BuildContext context) {
    final p = profile;
    Duration d(int ms) => Duration(milliseconds: 120 + ms);
    return Scaffold(
      body: SafeArea(
        child: KeyedSubtree(
          key: ValueKey(_generation),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
            children: [
              Row(
                children: [
                  const Text('.389', style: TextStyle(color: _C.char, fontSize: 26, fontWeight: FontWeight.w700, letterSpacing: -0.5)),
                  const SizedBox(width: 8),
                  const Text('プロ野球クイズ', style: TextStyle(color: _C.label, fontSize: 11)),
                  const Spacer(),
                  _FlapRow('16:48', cells: 5, w: 14, h: 20, size: 12, color: _C.amber, delay: d(0)),
                ],
              ),
              const SizedBox(height: 12),
              _Board(
                title: '本日の案内',
                child: Column(
                  children: [
                    const _HeadLine(['時刻', '種別', '番号', '状況']),
                    _DepartureRow(
                      time: '19:00',
                      kind: '今日の1問',
                      number: '${p.dailyNumber}',
                      status: p.dailyDone ? '済' : '受付中',
                      statusColor: p.dailyDone ? _C.dim : _C.green,
                      delay: d(80),
                      onTap: p.dailyDone ? null : () => _go(_Quiz(session: _dailySession())),
                    ),
                    _DepartureRow(time: '', kind: 'ノーマル', number: '', status: 'いつでも', statusColor: _C.amber, delay: d(160), onTap: () => _go(_Quiz(session: _normalSession()))),
                    _DepartureRow(
                      time: '',
                      kind: 'タイマー',
                      number: '3秒',
                      status: 'いつでも',
                      statusColor: _C.amber,
                      delay: d(240),
                      onTap: () => _go(_Quiz(session: _normalSession(), auto: true)),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(4, 8, 4, 0),
                child: Text(
                  p.dailyDone ? '次の今日の1問まで ${p.untilNext.inHours}時間${p.untilNext.inMinutes % 60}分' : '今日の1問は 3 回まで答えられます。ノーマルの条件: 全球団・通算 300 試合以上',
                  style: const TextStyle(color: _C.label, fontSize: 11),
                ),
              ),
              const SizedBox(height: 16),
              _Board(
                title: 'あなたの成績',
                trailing: GestureDetector(
                  onTap: () => _go(const _Arrivals()),
                  child: const Text('到着実績 ›', style: TextStyle(color: _C.char, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('打率', style: TextStyle(color: _C.label, fontSize: 10)),
                            const SizedBox(height: 4),
                            _FlapRow(p.average, cells: 4, w: 40, h: 56, size: 36, delay: d(320), gap: 3),
                          ],
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _Stat(label: '打数', value: '${p.plays}', delay: d(420)),
                              const SizedBox(height: 6),
                              _Stat(label: '安打', value: '${p.correct}', delay: d(470)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        const Text('今週', style: TextStyle(color: _C.label, fontSize: 10)),
                        const SizedBox(width: 10),
                        for (var i = 0; i < 7; i++) ...[
                          Column(
                            children: [
                              _Lamp(on: p.weekDays.contains(i)),
                              const SizedBox(height: 3),
                              Text('月火水木金土日'[i], style: TextStyle(color: i == Profile.today ? _C.char : _C.dim, fontSize: 9)),
                            ],
                          ),
                          const SizedBox(width: 10),
                        ],
                        const Spacer(),
                        _FlapRow('${p.streak}'.padLeft(2, '0'), cells: 2, w: 16, h: 22, size: 13, delay: d(520)),
                        const Text(' 日連続', style: TextStyle(color: _C.label, fontSize: 10)),
                      ],
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

QuizSession _normalSession() => QuizSession(player: quizPlayers[DateTime.now().millisecond % quizPlayers.length]);

QuizSession _dailySession() => QuizSession(player: quizPlayers[profile.dailyNumber % quizPlayers.length], mode: QuizMode.daily, seed: profile.dailyNumber);

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, this.delay});

  final String label;
  final String value;
  final Duration? delay;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 30, child: Text(label, style: const TextStyle(color: _C.label, fontSize: 10))),
        _FlapRow(value, cells: 3, w: 16, h: 22, size: 13, delay: delay),
      ],
    );
  }
}

class _HeadLine extends StatelessWidget {
  const _HeadLine(this.labels);

  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    const flex = [5, 9, 4, 5];
    return Padding(
      padding: const EdgeInsets.only(bottom: 4, left: 10),
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++)
            Expanded(flex: flex[i], child: Text(labels[i], style: const TextStyle(color: _C.label, fontSize: 9, letterSpacing: 1))),
        ],
      ),
    );
  }
}

class _DepartureRow extends StatelessWidget {
  const _DepartureRow({required this.time, required this.kind, required this.number, required this.status, required this.statusColor, required this.onTap, this.delay});

  final String time;
  final String kind;
  final String number;
  final String status;
  final Color statusColor;
  final VoidCallback? onTap;
  final Duration? delay;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: onTap != null,
      label: '$kind $status',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Row(
              children: [
                Container(width: 3, height: 26, color: onTap == null ? Colors.transparent : _C.amber),
                const SizedBox(width: 7),
                Expanded(flex: 5, child: _FlapRow(time, cells: 5, w: 13, h: 26, size: 12, color: _C.amber, delay: delay, left: true, gap: 1)),
                Expanded(flex: 9, child: _FlapRow(kind, cells: 5, w: 22, h: 26, size: 14, delay: delay, left: true)),
                Expanded(flex: 4, child: _FlapRow(number, cells: 3, w: 14, h: 26, size: 12, delay: delay, left: true, gap: 1)),
                Expanded(flex: 5, child: _FlapRow(status, cells: 4, w: 17, h: 26, size: 11, color: statusColor, delay: delay, left: true, gap: 1)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ───────────────────────── クイズ ─────────────────────────

class _Quiz extends StatefulWidget {
  const _Quiz({required this.session, this.openAnswer = false, this.auto = false});

  final QuizSession session;
  final bool openAnswer;
  final bool auto;

  @override
  State<_Quiz> createState() => _QuizState();
}

class _QuizState extends State<_Quiz> with SingleTickerProviderStateMixin {
  QuizSession get s => widget.session;

  /// 自動で開ける間隔。製品のタイマーモードの既定に合わせた。
  static const _interval = Duration(seconds: 3);
  late final _auto = AnimationController(vsync: this, duration: _interval);
  String? _pending;
  bool _pendingWrong = false;

  @override
  void initState() {
    super.initState();
    s.addListener(_changed);
    _auto.addStatusListener((st) {
      if (st == AnimationStatus.completed && !s.isOver) {
        s.revealNext();
        if (s.unveil < s.total) _auto.forward(from: 0);
      }
    });
    if (widget.auto) _auto.forward();
    if (widget.openAnswer) WidgetsBinding.instance.addPostFrameCallback((_) => _answer());
  }

  @override
  void dispose() {
    s.removeListener(_changed);
    _auto.dispose();
    super.dispose();
  }

  void _changed() => setState(() {});

  void _toggleAuto() {
    setState(() {
      if (_auto.isAnimating) {
        _auto.stop();
      } else {
        _auto.forward();
      }
    });
  }

  Future<void> _answer() async {
    final wasRunning = _auto.isAnimating;
    _auto.stop();
    final name = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(14))),
      builder: (_) => _AnswerSheet(wrong: s.wrongNames),
    );
    if (!mounted) return;
    if (name == null) {
      if (wasRunning) _auto.forward();
      return;
    }
    // 回答の行に名前を回して出してから判定する。盤が答え合わせをしている間を作る。
    setState(() {
      _pending = name;
      _pendingWrong = false;
    });
    await Future<void>.delayed(Duration(milliseconds: _still(context) ? 0 : 650));
    if (!mounted) return;
    final outcome = s.guess(name);
    if (outcome == GuessOutcome.correct || outcome == GuessOutcome.failed) {
      Navigator.of(context).pushReplacement(_cut(_Result(session: s)));
      return;
    }
    setState(() => _pendingWrong = true);
    await Future<void>.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    setState(() => _pending = null);
    if (wasRunning) _auto.forward();
  }

  Future<void> _menu() async {
    _auto.stop();
    final choice = await showModalBottomSheet<String>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (s.mode == QuizMode.normal)
              ListTile(
                leading: const Icon(Icons.grid_on, color: _C.char),
                title: const Text('全部開ける'),
                subtitle: const Text('当てても判定は C になります'),
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
      Navigator.of(context).pushReplacement(_cut(_Result(session: s)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final daily = s.mode == QuizMode.daily;
    final rank = s.rankNow;
    final left = s.cellsBeforeDrop;
    final running = _auto.isAnimating;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 4, 4, 0),
              child: Row(
                children: [
                  IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.char), tooltip: '案内へ戻る'),
                  Text(daily ? '今日の1問 No.${profile.dailyNumber}' : (widget.auto ? 'タイマー' : 'ノーマル'), style: const TextStyle(color: _C.char, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  if (daily)
                    Semantics(
                      label: '残り ${s.livesLeft} 回',
                      child: Row(children: [for (var i = 0; i < QuizSession.dailyLives; i++) Padding(padding: const EdgeInsets.only(left: 6), child: _Lamp(on: i < s.livesLeft, color: _C.red, size: 12))]),
                    ),
                  IconButton(onPressed: _menu, icon: const Icon(Icons.more_horiz, color: _C.char), tooltip: 'そのほか'),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
                child: Column(
                  children: [
                    _Board(
                      title: '年度別打撃成績',
                      trailing: Row(
                        children: [
                          const Text('開示 ', style: TextStyle(color: _C.label, fontSize: 10)),
                          _FlapRow('${s.unveil}'.padLeft(2, '0'), cells: 2, w: 13, h: 18, size: 11, color: _C.amber),
                          Text(' / ${s.total}', style: const TextStyle(color: _C.label, fontSize: 10)),
                        ],
                      ),
                      child: _StatsBoard(session: s),
                    ),
                    const SizedBox(height: 10),
                    _Board(
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Text('いま当てれば', style: TextStyle(color: _C.label, fontSize: 11)),
                              const SizedBox(width: 8),
                              _FlapRow(rank.label, cells: 2, w: 22, h: 30, size: 18, color: _rankColor(rank)),
                              const Spacer(),
                              Text(
                                left == null ? 'これより下はない' : (left <= 0 ? '次の 1 枚で下がる' : 'あと $left 枚で下がる'),
                                style: TextStyle(color: left != null && left <= 0 ? _C.red : _C.label, fontSize: 11),
                              ),
                            ],
                          ),
                          if (_pending != null || s.wrongNames.isNotEmpty) const SizedBox(height: 8),
                          if (_pending != null) _AnswerLine(name: _pending!, wrong: _pendingWrong),
                          for (final n in s.wrongNames.reversed)
                            if (n != _pending) _AnswerLine(name: n, wrong: true, settled: true),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (running || widget.auto)
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                child: AnimatedBuilder(
                  animation: _auto,
                  builder: (context, _) => LinearProgressIndicator(
                    value: _auto.value,
                    minHeight: 3,
                    color: _C.amber,
                    backgroundColor: const Color(0xFF2A2C31),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Row(
                children: [
                  SizedBox(
                    width: 76,
                    child: _Key(label: running ? '止める' : '自動', sub: '3秒ごと', color: const Color(0xFF3A3D44), ink: _C.char, onTap: s.unveil >= s.total ? null : _toggleAuto),
                  ),
                  const SizedBox(width: 8),
                  Expanded(child: _Key(label: 'めくる', color: _C.amber, onTap: s.unveil >= s.total || running ? null : s.revealNext)),
                  const SizedBox(width: 8),
                  Expanded(child: _Key(label: '答える', onTap: _pending != null ? null : _answer)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 回答の行。名前を回して出し、外れなら赤に替えて × を付ける。
class _AnswerLine extends StatelessWidget {
  const _AnswerLine({required this.name, required this.wrong, this.settled = false});

  final String name;
  final bool wrong;
  final bool settled;

  @override
  Widget build(BuildContext context) {
    final text = name.replaceAll(' ', '');
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        children: [
          SizedBox(width: 40, child: Text(settled ? '外れ' : '回答', style: TextStyle(color: wrong ? _C.red : _C.label, fontSize: 10))),
          _FlapRow(text, cells: 6, w: 20, h: 24, size: 13, color: wrong ? _C.red : _C.char, delay: settled ? null : Duration.zero, left: true),
          const SizedBox(width: 8),
          if (wrong) const Icon(Icons.close, color: _C.red, size: 18),
        ],
      ),
    );
  }
}

/// 成績の盤。列ごとに最も長い値の文字数だけ札を並べる。
class _StatsBoard extends StatelessWidget {
  const _StatsBoard({required this.session, this.cascade = false});

  final QuizSession session;

  /// 置いた時点で全部を空から回して出す（結果の盤）。
  final bool cascade;

  @override
  Widget build(BuildContext context) {
    final s = session;
    String shown(int r, int c) {
      final v = s.value(r, c);
      return s.stats[c] == '球団' ? _abbr(v) : v;
    }

    final widths = [
      for (var c = 0; c < s.stats.length; c++) [for (var r = 0; r < s.yearCount; r++) shown(r, c).length].reduce(math.max),
    ];
    return LayoutBuilder(
      builder: (context, box) {
        final totalCells = 4 + widths.fold(0, (a, b) => a + b);
        const gaps = 12.0;
        final w = ((box.maxWidth - gaps * s.stats.length - 2 * totalCells) / totalCells).clamp(12.0, 22.0);
        final h = w * 1.3;
        Widget col(int cells, Widget child, {bool first = false}) => Padding(
          padding: EdgeInsets.only(left: first ? 0 : gaps),
          child: SizedBox(width: cells * (w + 2) - 2, child: child),
        );
        return Column(
          children: [
            Row(
              children: [
                col(4, const Text('年度', style: TextStyle(color: _C.label, fontSize: 9)), first: true),
                for (var c = 0; c < s.stats.length; c++)
                  col(widths[c], Text(s.stats[c], textAlign: TextAlign.right, maxLines: 1, softWrap: false, overflow: TextOverflow.visible, style: const TextStyle(color: _C.label, fontSize: 9))),
              ],
            ),
            const SizedBox(height: 4),
            for (var r = 0; r < s.yearCount; r++)
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Row(
                  children: [
                    col(4, _FlapRow(s.year(r), cells: 4, w: w, h: h, size: w * 0.62, color: _C.label), first: true),
                    for (var c = 0; c < s.stats.length; c++)
                      col(
                        widths[c],
                        Align(
                          alignment: Alignment.centerRight,
                          child: _FlapRow(
                            s.isRevealed(r, c) ? shown(r, c) : '',
                            cells: widths[c],
                            w: w,
                            h: h,
                            size: w * 0.72,
                            color: s.lastRevealed == (r, c) && !s.isOver ? _C.amber : _C.char,
                            delay: cascade ? Duration(milliseconds: 200 + r * 45 + c * 30) : null,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
          ],
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
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('回答する選手', style: TextStyle(color: _C.amber, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 2)),
              const SizedBox(height: 10),
              TextField(
                controller: _text,
                autofocus: true,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(color: _C.char, fontSize: 17),
                cursorColor: _C.amber,
                decoration: InputDecoration(
                  hintText: '名前の一部（例: 柳田）',
                  hintStyle: const TextStyle(color: _C.dim),
                  filled: true,
                  fillColor: _C.housing,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 6),
              SizedBox(
                height: 264,
                child: hits.isEmpty
                    ? Center(child: Text(_text.text.isEmpty ? '名前を入れると候補が出ます' : '該当する選手がいません', style: const TextStyle(color: _C.dim)))
                    : ListView(
                        children: [
                          for (final n in hits)
                            ListTile(
                              dense: true,
                              enabled: !widget.wrong.contains(n),
                              title: Text(
                                n,
                                style: TextStyle(
                                  color: widget.wrong.contains(n) ? _C.dim : _C.char,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  decoration: widget.wrong.contains(n) ? TextDecoration.lineThrough : null,
                                ),
                              ),
                              trailing: widget.wrong.contains(n) ? const Text('外れ', style: TextStyle(color: _C.red, fontSize: 11)) : const Icon(Icons.chevron_right, color: _C.amber),
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

// ───────────────────────── 結果（判定の盤） ─────────────────────────

class _Result extends StatelessWidget {
  const _Result({required this.session});

  final QuizSession session;

  @override
  Widget build(BuildContext context) {
    final s = session;
    final rank = s.finalRank;
    final won = s.status == QuizStatus.correct;
    final team = teamShort[s.player.team] ?? s.player.team;
    final given = s.player.name.split(' ').skip(1).join();
    const d = Duration(milliseconds: 120);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.close, color: _C.char), tooltip: '案内へ戻る'),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Column(
                  children: [
                    _Board(
                      title: won ? '正解' : (s.status == QuizStatus.failed ? '3 回外れ' : '答え'),
                      trailing: Text(s.mode == QuizMode.daily ? '今日の1問 No.${profile.dailyNumber}' : 'ノーマル', style: const TextStyle(color: _C.label, fontSize: 10)),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FlapRow(s.player.family, cells: 3, w: 46, h: 60, size: 38, delay: d, left: true, gap: 3),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    _FlapRow(given, cells: 3, w: 22, h: 28, size: 15, delay: d + const Duration(milliseconds: 160), left: true),
                                    const SizedBox(width: 10),
                                    Text(team, style: const TextStyle(color: _C.label, fontSize: 12)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Column(
                            children: [
                              const Text('判定', style: TextStyle(color: _C.label, fontSize: 10)),
                              const SizedBox(height: 4),
                              _FlapRow(rank.label, cells: 2, w: 40, h: 64, size: 36, color: _rankColor(rank), delay: d + const Duration(milliseconds: 420), gap: 3),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    _Board(
                      child: Column(
                        children: [
                          _ResultLine(label: '開示', value: '${s.unveil}/${s.total}', note: '${(s.rate * 100).round()}%', delay: d + const Duration(milliseconds: 600)),
                          _ResultLine(label: '外れ', value: '${s.incorrect}', note: '回', delay: d + const Duration(milliseconds: 680)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    _Board(title: '年度別打撃成績', child: _StatsBoard(session: s, cascade: true)),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Row(
                children: [
                  Expanded(child: _Key(label: '共有', color: const Color(0xFF3A3D44), ink: _C.char, onTap: () => _share(context))),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: _Key(label: s.mode == QuizMode.daily ? 'ノーマルへ' : 'もう 1 問', color: _C.amber, onTap: () => Navigator.of(context).pushReplacement(_cut(_Quiz(session: _normalSession())))),
                  ),
                ],
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
        child: Padding(padding: EdgeInsets.all(24), child: Text('製品では、判定の盤を画像にして OS の共有シートを開く。試作では開かない。')),
      ),
    );
  }
}

class _ResultLine extends StatelessWidget {
  const _ResultLine({required this.label, required this.value, required this.note, this.delay});

  final String label;
  final String value;
  final String note;
  final Duration? delay;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(width: 48, child: Text(label, style: const TextStyle(color: _C.label, fontSize: 11))),
          _FlapRow(value, cells: 5, w: 18, h: 26, size: 14, delay: delay),
          const SizedBox(width: 8),
          Text(note, style: const TextStyle(color: _C.label, fontSize: 11)),
        ],
      ),
    );
  }
}

// ───────────────────────── 到着実績（マイ成績） ─────────────────────────

class _Arrivals extends StatelessWidget {
  const _Arrivals();

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final col = p.collection;
    const d = Duration(milliseconds: 100);
    const days = ['今日', '昨日'];
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
          children: [
            Row(
              children: [
                IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back, color: _C.char), tooltip: '案内へ戻る'),
                const Text('到着実績', style: TextStyle(color: _C.char, fontSize: 17, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 8),
            _Board(
              title: '今季の成績',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _FlapRow(p.average, cells: 4, w: 40, h: 56, size: 36, delay: d, gap: 3),
                      const SizedBox(width: 12),
                      Text('${p.plays} 打数 ${p.correct} 安打', style: const TextStyle(color: _C.label, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      for (final r in const [Rank.ss, Rank.s, Rank.a, Rank.b, Rank.c]) ...[
                        Column(
                          children: [
                            Text(r.label, style: TextStyle(color: _rankColor(r), fontSize: 10, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 3),
                            _FlapRow('${p.count(r)}'.padLeft(2, '0'), cells: 2, w: 16, h: 22, size: 13, delay: d + Duration(milliseconds: 60 * r.index)),
                          ],
                        ),
                        const SizedBox(width: 14),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            _Board(
              title: '正解した選手　球団別',
              child: Column(
                children: [
                  for (final t in teamOrder)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          SizedBox(width: 26, child: Text(_abbr(t), style: const TextStyle(color: _C.char, fontSize: 13, fontWeight: FontWeight.w700))),
                          for (var i = 0; i < Profile.teamSize[t]!; i++) ...[
                            _Lamp(on: i < col[t]!.length, size: 12),
                            const SizedBox(width: 5),
                          ],
                          const Spacer(),
                          Text('${col[t]!.length}/${Profile.teamSize[t]}', style: const TextStyle(color: _C.label, fontSize: 11)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            _Board(
              title: '最近の到着',
              child: Column(
                children: [
                  for (final (i, r) in p.records.take(12).indexed)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          SizedBox(width: 38, child: Text(r.day < 2 ? days[r.day] : '${r.day}日前', style: const TextStyle(color: _C.label, fontSize: 10))),
                          SizedBox(width: 26, child: Text(r.daily ? '今日' : '', style: const TextStyle(color: _C.amber, fontSize: 9))),
                          _FlapRow(r.player.name.replaceAll(' ', ''), cells: 6, w: 18, h: 24, size: 12, delay: d + Duration(milliseconds: 40 * i), left: true),
                          const Spacer(),
                          _FlapRow(r.rank.label, cells: 2, w: 18, h: 24, size: 12, color: _rankColor(r.rank), delay: d + Duration(milliseconds: 40 * i + 120)),
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

/// 盤の切り替え。文字が回る動きが主役なので、画面そのものは短く切り替える。
PageRoute<void> _cut(Widget screen) => PageRouteBuilder<void>(
  transitionDuration: const Duration(milliseconds: 140),
  pageBuilder: (_, _, _) => screen,
  transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
);
