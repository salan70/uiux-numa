import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

import '../../shared/app.dart';
import '../../shared/directory.dart';
import '../../shared/format.dart';
import '../../shared/game_input.dart';
import '../../shared/model.dart';
import '../../shared/nav.dart';
import '../../shared/store.dart';
import '../../shared/theme.dart';
import '../../shared/widgets.dart';
import '../../shared/parts.dart';
import '../../shared/pixel.dart';

// diamond: baseball-journey-reel のリールで描いた UI を、操作できる形にした。
// 情報構造は round 2〜3 の matchday（削除済み、README に記録）を引き継ぎ、タイトル → 選手トップ → 試合 → 試合後の 1 本にする。
// 変えた軸は見た目と動きで、夜の球場と電光掲示板、ドット絵の選手の札、押した結果が打席の列へ飛ぶ入力、
// 上限をばねで返す増減、桁が転がる試合後にした。動きは頻度で予算を分け、1 季 143 回の入力は短く、稀な場面だけ長くする。
// 選手の作成、シーズンの終了と引退、選手の詳細、設定、試合の履歴、スコアは shared の画面を使う。

Widget buildVariant() => JourneyApp(home: (_) => const _Title());

/// 起動ごとに 1 回だけ札を組み上げる。1 季に 143 回開く選手トップで、毎回は組み上げない。
final _revealedPlayers = <String>{};

/// タイトル画面。夜の球場の掲示板に題字を点灯し、続きからの選手をドット絵で先に見せる。
class _Title extends StatefulWidget {
  const _Title();

  @override
  State<_Title> createState() => _TitleState();
}

class _TitleState extends State<_Title> with SingleTickerProviderStateMixin {
  late final _lit = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      if (Motion.reduced(context)) {
        _lit.value = 1;
      } else {
        _lit.forward();
      }
      final store = StoreScope.read(context);
      final route = store.options.route;
      if (route == null || route == 'title') return;
      if (route == 'directory') {
        _openDirectory(context);
        return;
      }
      if (openSharedRoute(context, store)) return;
      if (store.current == null) return;
      _openTop(context);
      switch (route) {
        case 'game' || 'input':
          _openMatchday(context);
        case 'score':
          _openMatchday(context);
          showScoreSheet(context);
        case 'afterGame':
          _openMatchday(context);
          await store.saveGame(5, 2);
        case 'topAfterGame':
          await store.saveGame(5, 2);
        case 'menu':
          _openMenu(context);
      }
    });
  }

  @override
  void dispose() {
    _lit.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final player = store.current;
    return Scaffold(
      backgroundColor: Night.field,
      body: CustomPaint(
        painter: const NightFieldPainter(),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, c) => SingleChildScrollView(
              padding: const EdgeInsets.all(Space.s600),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: c.maxHeight - Space.s600 * 2),
                child: IntrinsicHeight(child: _column(context, store, player)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _column(BuildContext context, AppStore store, Player? player) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        Semantics(
          header: true,
          label: 'Baseball Player Journey',
          excludeSemantics: true,
          child: LayoutBuilder(
            builder: (context, c) {
              // 最も長い BASEBALL の 47 点が、掲示板の内側に収まる間隔にする。
              final pitch = ((c.maxWidth - Space.s400 * 2 - Bold.border * 2) / 47).floorToDouble();
              return Container(
                padding: const EdgeInsets.all(Space.s400),
                decoration: BoxDecoration(
                  color: Night.board,
                  borderRadius: BorderRadius.circular(Bold.radius),
                  border: Border.all(color: Colors.black, width: Bold.border),
                  boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(Bold.shadow + 2, Bold.shadow + 2))],
                ),
                child: Center(
                  child: AnimatedBuilder(
                    animation: _lit,
                    builder: (context, _) => DotText(
                      const ['BASEBALL', 'PLAYER', 'JOURNEY'],
                      pitch: pitch,
                      offColor: Night.ledOff,
                      lit: Curves.easeInOut.transform(_lit.value),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: Space.s400),
        Text(
          '1 試合ずつ、自分だけの選手名鑑を。',
          textAlign: TextAlign.center,
          style: Txt.control.copyWith(color: Night.ink),
        ),
        const Spacer(),
        if (player != null) ...[
          KeyButton(
            label: 'つづきから',
            fill: Palette.of(context).primary,
            height: 56,
            textStyle: Txt.heading,
            onPressed: () => _openTop(context),
          ),
          Padding(
            padding: const EdgeInsets.only(top: Space.s150, bottom: Space.s400),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                PixelAvatar(player: player, size: 28),
                const SizedBox(width: Space.s200),
                Flexible(
                  child: Text(
                    '${player.name}・${year(player.current.year)} 第 ${player.current.playedCount + 1} 戦から',
                    style: Txt.caption.copyWith(color: Night.ink),
                  ),
                ),
              ],
            ),
          ),
        ],
        KeyButton(
          label: '選手を作る',
          fill: player == null ? Palette.of(context).primary : null,
          onPressed: store.canCreatePlayer ? () => openCreation(context) : null,
        ),
        const SizedBox(height: Space.s300),
        Row(
          children: [
            Expanded(
              child: KeyButton(label: '名鑑', onPressed: store.players.isEmpty ? null : () => _openDirectory(context)),
            ),
            const SizedBox(width: Space.s300),
            Expanded(
              child: KeyButton(label: '設定', onPressed: () => openSettings(context)),
            ),
          ],
        ),
        if (player == null) ...[
          const SizedBox(height: Space.s400),
          Text(
            'まだ選手がいません。選手を作ると、1 試合ずつ記録できます。',
            textAlign: TextAlign.center,
            style: Txt.ui.copyWith(color: Night.ink),
          ),
        ],
      ],
    );
  }
}

void _openDirectory(BuildContext context) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const _Directory()));
}

void _openTop(BuildContext context) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const _PlayerTop()));
}

void _openMatchday(BuildContext context) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const _Matchday()));
}

Future<void> _openMenu(BuildContext context) {
  final store = StoreScope.read(context);
  final player = store.current!;
  final navigator = Navigator.of(context);
  Widget item(IconData icon, String label, VoidCallback onTap) => ListTile(
    minTileHeight: Sizes.target + Space.s200,
    leading: Icon(icon),
    title: Text(label, style: Txt.control),
    onTap: () {
      navigator.pop();
      onTap();
    },
  );
  return showModalBottomSheet<void>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    builder: (_) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          item(Icons.bar_chart, '記録', () => openDetail(context, player)),
          item(Icons.list_alt, '${year(player.current.year)}の試合', () => openHistory(context, player)),
          item(Icons.people_alt_outlined, '名鑑', () => _openDirectory(context)),
          item(Icons.settings_outlined, '設定', () => openSettings(context)),
          item(Icons.home_outlined, 'タイトルへ', () => navigator.popUntil((r) => r.isFirst)),
        ],
      ),
    ),
  );
}

/* ---------------------------------------------------------------- 選手トップ */

/// 選手トップ。選手の札、今季の升、成績、最近の試合を見てから、下端から次の試合へ進む。
class _PlayerTop extends StatefulWidget {
  const _PlayerTop();

  @override
  State<_PlayerTop> createState() => _PlayerTopState();
}

class _PlayerTopState extends State<_PlayerTop> with SingleTickerProviderStateMixin {
  late final _reveal = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400), value: 1);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final player = StoreScope.read(context).current;
      if (player == null || _revealedPlayers.contains(player.id)) return;
      _revealedPlayers.add(player.id);
      if (!Motion.reduced(context)) _reveal.forward(from: 0);
    });
  }

  @override
  void dispose() {
    _reveal.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final player = store.current;
    if (player == null) return const Scaffold();
    final season = player.current;
    final draft = store.draft;
    final summary = store.lastSummary;
    return Scaffold(
      appBar: AppBar(
        centerTitle: false,
        titleSpacing: 0,
        title: const Text('選手トップ'),
        actions: [IconButton(tooltip: 'メニュー', icon: const Icon(Icons.menu), onPressed: () => _openMenu(context))],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s1000),
        children: [
          AnimatedBuilder(
            animation: _reveal,
            builder: (context, _) => PlayerCard(player: player, reveal: _reveal.value),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(onPressed: () => openDetail(context, player), child: const Text('記録を見る')),
          ),
          if (draft != null)
            Panel(
              color: p.secondaryContainer,
              child: Text(
                '第 ${season.playedCount + 1} 戦を入力しています。${draft.line}。',
                style: Txt.control.copyWith(color: p.onSecondaryContainer),
              ),
            )
          else if (summary != null) ...[
            SectionTitle(
              '前の試合',
              trailing: IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: store.dismissSummary),
            ),
            for (final m in summary.milestones)
              Padding(
                padding: const EdgeInsets.only(bottom: Space.s200),
                child: MilestoneBanner(text: m),
              ),
            GameLine(game: summary.game),
          ],
          SectionTitle(
            year(season.year),
            trailing: Text(
              '${season.playedCount} / ${season.totalGames} 試合',
              style: Txt.control.merge(Txt.tabular),
            ),
          ),
          SeasonGrid(season: season),
          const SizedBox(height: Space.s200),
          SeasonGridLegend(season: season),
          SectionTitle('${year(season.year)}の成績'),
          SeasonStatGrid(line: season.line, before: summary?.seasonBefore),
          SectionTitle(
            '最近の試合',
            trailing: TextButton(onPressed: () => openHistory(context, player), child: const Text('すべて')),
          ),
          if (season.games.isEmpty)
            Text('まだ試合がありません。下の「第 1 戦へ」から始めます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant))
          else
            for (final g in season.games.reversed.take(5)) GameLine(game: g),
        ],
      ),
      bottomNavigationBar: _TopActions(player: player),
    );
  }
}

/// 選手トップの下端。入力中なら戻る、全試合の後ならシーズンの終了、それ以外は次の試合と欠場。
class _TopActions extends StatelessWidget {
  const _TopActions({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final season = player.current;
    final Widget content;
    if (store.draft != null) {
      content = KeyButton(
        label: '第 ${season.playedCount + 1} 戦の入力に戻る',
        fill: p.primary,
        onPressed: () => _openMatchday(context),
      );
    } else if (season.isComplete) {
      content = KeyButton(
        label: 'シーズンを終える',
        fill: p.primary,
        onPressed: () async {
          final navigator = Navigator.of(context);
          final retired = await openSeasonEnd(context, player);
          if (!retired) navigator.push(MaterialPageRoute<void>(builder: (_) => const _PlayerTop()));
        },
      );
    } else {
      content = Row(
        children: [
          Expanded(
            child: KeyButton(
              label: '欠場で進める',
              semanticsHint: '出場しない試合の数を選びます',
              oneLine: true,
              onPressed: () async {
                final choice = await showParticipationSheet(context, player, initialKind: ParticipationKind.none);
                if (choice != null) applyChoice(store, choice);
              },
            ),
          ),
          const SizedBox(width: Space.s300),
          Expanded(
            child: KeyButton(
              label: '第 ${season.playedCount + 1} 戦へ',
              fill: p.primary,
              semanticsHint: '出場のしかたを選んで、試合を記録します',
              oneLine: true,
              onPressed: () {
                store.dismissSummary();
                _openMatchday(context);
              },
            ),
          ),
        ],
      );
    }
    return _BottomBar(child: content);
  }
}

/// 画面の下端に固定する操作の帯。選手トップと試合後で、次の試合へ進む操作を同じ場所に置く。
class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      decoration: BoxDecoration(
        color: p.background,
        border: Border(top: BorderSide(color: p.ink, width: Borders.thick)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s200),
          child: child,
        ),
      ),
    );
  }
}

/// 試合後の下端。1 季に 143 回押す「次の試合へ」を、143 の升の下までスクロールせずに押せるようにする。
class _AfterGameActions extends StatelessWidget {
  const _AfterGameActions({required this.season});

  final Season season;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    // 2 つを並べる幅では、文字 2 倍で「選手トッ/プへ」と割れるので 1 行に保つ。
    final toTop = KeyButton(
      label: '選手トップへ',
      fill: season.isComplete ? p.primary : null,
      oneLine: true,
      onPressed: () => Navigator.of(context).pop(),
    );
    if (season.isComplete) return _BottomBar(child: toTop);
    return _BottomBar(
      child: Row(
        children: [
          Expanded(child: toTop),
          const SizedBox(width: Space.s300),
          Expanded(
            child: KeyButton(
              label: '第 ${season.playedCount + 1} 戦へ',
              fill: p.primary,
              semanticsHint: '出場のしかたを選んで、試合を記録します',
              oneLine: true,
              onPressed: store.dismissSummary,
            ),
          ),
        ],
      ),
    );
  }
}

/* ---------------------------------------------------------------------- 試合 */

/// 常に見せる 12 の結果。残りは「ほかの結果」から選ぶ（shared の ResultPad と同じ分け方）。
const _mainResults = [
  AtBatResult.single,
  AtBatResult.double_,
  AtBatResult.triple,
  AtBatResult.homeRun,
  AtBatResult.walk,
  AtBatResult.hitByPitch,
  AtBatResult.swingOut,
  AtBatResult.missedStrikeout,
  AtBatResult.groundOut,
  AtBatResult.flyOut,
  AtBatResult.lineOut,
  AtBatResult.doublePlay,
];

/// 試合画面。掲示板、打席の列、選んだ打席の打点と走塁、下端の結果の面。保存した後は同じ画面で試合後を見せる。
class _Matchday extends StatefulWidget {
  const _Matchday();

  @override
  State<_Matchday> createState() => _MatchdayState();
}

class _MatchdayState extends State<_Matchday> {
  final _padKeys = {for (final r in AtBatResult.values) r: GlobalKey()};
  final _chipKeys = <int, GlobalKey>{};
  final _stripScroll = ScrollController();

  /// 飛んでいる途中の打席。着くまで列の札を隠し、着いたら跳ねさせる。
  final _inFlight = <int>{};
  int _landed = -1;
  int _landToken = 0;

  GlobalKey _chipKey(int i) => _chipKeys.putIfAbsent(i, GlobalKey.new);

  @override
  void dispose() {
    _stripScroll.dispose();
    super.dispose();
  }

  /// 結果を足し、押した札から打席の列へ札を飛ばす。押したものと増えたものを 1 本の軌跡で結ぶ。
  void _pick(AtBatResult result) {
    final store = StoreScope.read(context);
    final from = _rectOf(_padKeys[result]);
    store.addResult(result);
    final index = store.draft!.atBats.length - 1;
    if (Motion.reduced(context) || from == null) return;
    setState(() => _inFlight.add(index));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_stripScroll.hasClients) _stripScroll.jumpTo(0);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final to = _rectOf(_chipKeys[index]);
        if (!mounted || to == null) {
          setState(() => _inFlight.remove(index));
          return;
        }
        _fly(result.label, from, to, () {
          if (!mounted) return;
          setState(() {
            _inFlight.remove(index);
            _landed = index;
            _landToken++;
          });
        });
      });
    });
  }

  Rect? _rectOf(GlobalKey? key) {
    final box = key?.currentContext?.findRenderObject() as RenderBox?;
    if (box == null || !box.hasSize) return null;
    return box.localToGlobal(Offset.zero) & box.size;
  }

  void _fly(String label, Rect from, Rect to, VoidCallback onLand) {
    final overlay = Overlay.of(context);
    final overlayBox = overlay.context.findRenderObject() as RenderBox;
    final a = overlayBox.globalToLocal(from.center);
    final b = overlayBox.globalToLocal(to.center);
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (_) => _Flight(
        label: label,
        from: a,
        to: b,
        onDone: () {
          entry.remove();
          onLand();
        },
      ),
    );
    overlay.insert(entry);
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final player = store.current;
    if (player == null) return const Scaffold();
    final season = player.current;
    final draft = store.draft;
    final summary = store.lastSummary;
    final large = MediaQuery.textScalerOf(context).scale(1) >= 1.5;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => Navigator.of(context).maybePop()),
        centerTitle: false,
        titleSpacing: 0,
        title: Text(player.name),
        actions: [IconButton(tooltip: 'メニュー', icon: const Icon(Icons.menu), onPressed: () => _openMenu(context))],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s600),
        children: [
          _Scoreboard(player: player, draft: draft),
          const SizedBox(height: Space.s400),
          if (summary != null)
            _AfterGame(key: ValueKey(summary), summary: summary)
          else if (draft != null) ...[
            _AtBatRow(
              draft: draft,
              keyOf: _chipKey,
              hidden: _inFlight,
              landed: _landed,
              landToken: _landToken,
              controller: _stripScroll,
            ),
            const SizedBox(height: Space.s200),
            _AtBatEditor(draft: draft),
          ] else if (season.isComplete) ...[
            Text('${year(season.year)}の全 ${season.totalGames} 試合を終えました。', style: Txt.body),
            const SizedBox(height: Space.s300),
            KeyButton(
              label: '選手トップへ',
              fill: Palette.of(context).primary,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ] else ...[
            Semantics(header: true, child: const Text('今日の出場', style: Txt.heading)),
            const SizedBox(height: Space.s300),
            ParticipationForm(player: player, onDecided: (c) => applyChoice(store, c)),
          ],
        ],
      ),
      bottomNavigationBar: summary != null
          ? _AfterGameActions(season: season)
          : draft == null
          ? null
          : InputDock(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _Pad(keys: _padKeys, onPick: _pick),
                  // 文字 2 倍では 3 つを 1 行に収められないので、ほかの結果を 1 段上に戻す。
                  if (large) ...[
                    const SizedBox(height: Space.s100),
                    _OtherResults(onPick: _pick),
                  ],
                  const SizedBox(height: Space.s200),
                  // 取り消すは形の知られた矢印だけにし、ほかの結果と同じ行に入れて入力面を 1 段低くする。
                  Row(
                    children: [
                      SizedBox(
                        width: Sizes.target + Bold.shadow,
                        child: KeyButton(
                          label: '',
                          icon: Icons.undo,
                          semanticsLabel: '取り消す',
                          semanticsHint: '最後の入力を消します',
                          onPressed: draft.isEmpty ? null : store.undo,
                        ),
                      ),
                      if (!large) ...[
                        const SizedBox(width: Space.s200),
                        Expanded(child: _OtherResults(onPick: _pick)),
                      ],
                      const SizedBox(width: Space.s200),
                      Expanded(
                        child: KeyButton(
                          label: '試合を終える',
                          fill: Palette.of(context).primary,
                          semanticsHint: 'スコアを入れて保存します',
                          onPressed: draft.canSave ? () => showScoreSheet(context) : null,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}

/// 押した結果の札が、弧を描いて打席の列へ飛ぶ。1 季に数百回あるので、リールの 360ms より短い 280ms にする。
class _Flight extends StatefulWidget {
  const _Flight({required this.label, required this.from, required this.to, required this.onDone});

  final String label;
  final Offset from;
  final Offset to;
  final VoidCallback onDone;

  @override
  State<_Flight> createState() => _FlightState();
}

class _FlightState extends State<_Flight> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 280))
    ..addStatusListener((s) {
      if (s == AnimationStatus.completed) widget.onDone();
    })
    ..forward();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final a = widget.from;
    final b = widget.to;
    final c = Offset((a.dx + b.dx) / 2 + 60, math.min(a.dy, b.dy) - 120);
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _c,
        builder: (context, child) {
          final q = Curves.easeInOutCubic.transform(_c.value);
          final pos = a * ((1 - q) * (1 - q)) + c * (2 * (1 - q) * q) + b * (q * q);
          return Stack(
            children: [
              Positioned(
                left: pos.dx,
                top: pos.dy,
                child: FractionalTranslation(
                  translation: const Offset(-0.5, -0.5),
                  child: Transform.rotate(angle: math.sin(math.pi * _c.value) * 0.22, child: child),
                ),
              ),
            ],
          );
        },
        child: Material(
          type: MaterialType.transparency,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s150),
            decoration: BoxDecoration(
              color: p.primaryContainer,
              borderRadius: BorderRadius.circular(Radii.control),
              border: Border.all(color: p.ink, width: Borders.thick),
              boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(4, 4))],
            ),
            child: Text(widget.label, style: Txt.control.copyWith(color: p.onSurface)),
          ),
        ),
      ),
    );
  }
}

/// 電光掲示板。試合前は選手と今季を、入力中は 1 行に縮めて今日の成績だけを出す。
/// 本塁打を足したときだけ HOME RUN! を点滅させる（本塁打は 1 季に数十回で、祝福の予算を使ってよい）。
class _Scoreboard extends StatefulWidget {
  const _Scoreboard({required this.player, required this.draft});

  final Player player;
  final GameDraft? draft;

  @override
  State<_Scoreboard> createState() => _ScoreboardState();
}

class _ScoreboardState extends State<_Scoreboard> with SingleTickerProviderStateMixin {
  late final _hr = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));
  int _seen = 0;

  @override
  void initState() {
    super.initState();
    _seen = widget.draft?.atBats.length ?? 0;
  }

  @override
  void didUpdateWidget(_Scoreboard old) {
    super.didUpdateWidget(old);
    final bats = widget.draft?.atBats ?? const <AtBat>[];
    if (bats.length > _seen && bats.last.result == AtBatResult.homeRun && !Motion.reduced(context)) {
      _hr.forward(from: 0);
    }
    _seen = bats.length;
  }

  @override
  void dispose() {
    _hr.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final player = widget.player;
    final draft = widget.draft;
    final s = player.current;
    final line = s.line;
    final number = s.isComplete ? s.totalGames : s.playedCount + 1;
    final board = BoxDecoration(
      color: Night.board,
      borderRadius: BorderRadius.circular(Bold.radius),
      border: Border.all(color: Palette.of(context).ink, width: Bold.border),
      boxShadow: [BoxShadow(color: Palette.of(context).shadow, offset: const Offset(Bold.shadow, Bold.shadow))],
    );
    if (draft != null) {
      return Semantics(
        liveRegion: true,
        label: '第 $number 戦、${draft.participation.label}、${draft.line}',
        excludeSemantics: true,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s200),
          decoration: board,
          child: Row(
            children: [
              DotText(['$number'], pitch: 3.5),
              const SizedBox(width: Space.s300),
              Expanded(
                child: AnimatedBuilder(
                  animation: _hr,
                  builder: (context, _) {
                    final on = _hr.isAnimating && ((_hr.value * 7).floor() % 2 == 0);
                    if (_hr.isAnimating) {
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Opacity(opacity: on ? 1 : 0.35, child: const DotText(['HOME RUN!'], pitch: 3)),
                      );
                    }
                    // 文字 2 倍では出場まで出すと 3 行になり、打席の列を押し下げる。
                    // 出場は試合の初めに選んだもので入力中は変わらないので、今日の成績だけを残す（読み上げには残る）。
                    final large = MediaQuery.textScalerOf(context).scale(1) >= 1.5;
                    return Wrap(
                      spacing: Space.s200,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        if (!large) Text(draft.participation.label, style: Txt.control.copyWith(color: Night.ink)),
                        Text(draft.line, style: Txt.control.merge(Txt.tabular).copyWith(color: Night.ink)),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.all(Space.s400),
      decoration: board,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFD4E0F7),
                  borderRadius: BorderRadius.circular(Radii.control),
                ),
                padding: const EdgeInsets.all(Space.s100),
                child: PixelAvatar(player: player, size: 48),
              ),
              const SizedBox(width: Space.s300),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(player.name, style: Txt.heading.copyWith(color: Night.ink)),
                    Text(
                      '${s.team.name}・${player.mainPosition.label}',
                      style: Txt.caption.copyWith(color: Night.ink),
                    ),
                  ],
                ),
              ),
              Semantics(
                label: '第 $number 戦、全 ${s.totalGames} 試合',
                excludeSemantics: true,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    DotText(['$number'], pitch: 5),
                    const SizedBox(height: Space.s100),
                    DotText(['/${s.totalGames}'], pitch: 2.5, color: Night.ledOn.withValues(alpha: 0.7)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: Space.s300),
          Text(
            '今季 ${rate(line.average)}  ${line.homeRuns} 本  ${line.rbi} 打点  ${line.steals} 盗塁',
            style: Txt.control.merge(Txt.tabular).copyWith(color: Night.ink),
          ),
        ],
      ),
    );
  }
}

/// 入力した打席の列。新しい打席を右端に置き、飛んでくる間は札を隠して、着いたら一度潰れて戻る。
class _AtBatRow extends StatelessWidget {
  const _AtBatRow({
    required this.draft,
    required this.keyOf,
    required this.hidden,
    required this.landed,
    required this.landToken,
    required this.controller,
  });

  final GameDraft draft;
  final GlobalKey Function(int) keyOf;
  final Set<int> hidden;
  final int landed;
  final int landToken;
  final ScrollController controller;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    if (draft.atBats.isEmpty && draft.runner == null) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.s300),
        child: Text('下の結果を押すと、打席が並びます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
      );
    }
    final chips = <Widget>[
      if (draft.runner != null)
        _BatChip(
          title: '代走',
          result: null,
          detail: '',
          selected: draft.selected == null,
          onTap: () => store.selectAtBat(null),
        ),
      for (var i = 0; i < draft.atBats.length; i++)
        Opacity(
          key: keyOf(i),
          opacity: hidden.contains(i) ? 0 : 1,
          child: _LandPop(
            token: i == landed ? landToken : 0,
            child: _BatChip(
              title: '第 ${i + 1} 打席',
              result: draft.atBats[i].result,
              detail: _detail(draft.atBats[i]),
              selected: draft.selected == i,
              onTap: () => store.selectAtBat(i),
            ),
          ),
        ),
    ];
    return SingleChildScrollView(
      controller: controller,
      scrollDirection: Axis.horizontal,
      reverse: true,
      clipBehavior: Clip.none,
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: chips),
    );
  }

  static String _detail(AtBat a) => [
    if (a.rbi > 0) '${a.rbi} 打点',
    if (a.steals > 0) '${a.steals} 盗塁',
    if (a.caughtStealing) '盗塁死',
    if (a.scored) '得点',
  ].join(' ');
}

class _BatChip extends StatelessWidget {
  const _BatChip({
    required this.title,
    required this.result,
    required this.detail,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final AtBatResult? result;
  final String detail;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final fill = selected ? p.secondaryContainer : p.surface;
    final fg = selected ? p.onSecondaryContainer : p.onSurface;
    return Padding(
      padding: const EdgeInsets.only(right: Space.s200, bottom: Space.s200),
      child: Semantics(
        button: true,
        selected: selected,
        label: '$title ${result?.label ?? ''} $detail',
        hint: '打点と走塁を直せます',
        excludeSemantics: true,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            constraints: const BoxConstraints(minWidth: 104, minHeight: Sizes.target),
            padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s150),
            decoration: BoxDecoration(
              color: fill,
              borderRadius: BorderRadius.circular(Radii.control),
              border: Border.all(color: selected ? p.ink : p.outline, width: Borders.thick),
              boxShadow: selected ? [BoxShadow(color: p.shadow, offset: const Offset(3, 3))] : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: Txt.caption.copyWith(color: fg)),
                if (result != null) Text(result!.label, style: Txt.control.copyWith(color: fg)),
                Text(detail.isEmpty ? '—' : detail, style: Txt.caption.copyWith(color: fg)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 着いた札を一度潰して戻す。token が変わるたびに 1 回だけ動く。
class _LandPop extends StatefulWidget {
  const _LandPop({required this.token, required this.child});

  final int token;
  final Widget child;

  @override
  State<_LandPop> createState() => _LandPopState();
}

class _LandPopState extends State<_LandPop> with SingleTickerProviderStateMixin {
  late final _c = AnimationController.unbounded(vsync: this, value: 0);

  @override
  void didUpdateWidget(_LandPop old) {
    super.didUpdateWidget(old);
    if (widget.token != old.token && widget.token != 0) {
      _c.value = 1;
      _c.animateWith(SpringSimulation(springOf(0.45, 4), 1, 0, 0));
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _c,
    builder: (context, child) => Transform(
      alignment: Alignment.bottomCenter,
      transform: Matrix4.diagonal3Values(1 + 0.1 * _c.value, 1 - 0.12 * _c.value, 1),
      child: child,
    ),
    child: widget.child,
  );
}

/// 選んだ打席の打点と走塁。上限は結果ごとに決まり（AC-005、AC-013、AC-014）、上限でもばねで押し返す。
class _AtBatEditor extends StatelessWidget {
  const _AtBatEditor({required this.draft});

  final GameDraft draft;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final i = draft.selected;
    // 代走の走塁は shared の編集をそのまま使う。
    if (i == null && draft.runner != null) return const AtBatEditor();
    if (i == null || i >= draft.atBats.length) return const SizedBox.shrink();
    final a = draft.atBats[i];
    final r = a.result;
    final steppers = [
      if (r.maxRbi > 0)
        RubberStepper(
          key: ValueKey('rbi-$i'),
          label: '打点',
          value: a.rbi,
          min: r.minRbi,
          max: r.maxRbi,
          onChanged: store.setRbi,
          limitNote: '${r.maxRbi} 打点までです',
          floorNote: r.minRbi > 0 ? '${r.minRbi} 打点以上です' : null,
          stacked: true,
        ),
      if (r.maxSteals > 0)
        RubberStepper(
          key: ValueKey('steal-$i'),
          label: '盗塁',
          value: a.steals,
          min: 0,
          max: r.maxSteals,
          onChanged: store.setSteals,
          limitNote: '${r.maxSteals} 盗塁までです',
          stacked: true,
        ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(child: Text('第 ${i + 1} 打席 ${r.label}', style: Txt.control)),
            TextButton(
              onPressed: () async {
                final next = await pickResult(context, title: '第 ${i + 1} 打席の結果');
                if (next != null) store.replaceResult(i, next);
              },
              child: const Text('結果を変える'),
            ),
            IconButton(
              tooltip: '第 ${i + 1} 打席を消す',
              onPressed: () => store.removeAtBat(i),
              icon: Icon(Icons.delete_outline, color: p.error),
            ),
          ],
        ),
        // 打点と盗塁は横に並べ、下端の入力面に隠れないよう高さを 1 段に抑える。片方だけなら左に寄せる。
        // 理由の行は半分の幅に収まるよう数だけを書く。何の上限かは上の「第 N 打席 結果」の行が示す。
        if (steppers.isNotEmpty)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: steppers.first),
              const SizedBox(width: Space.s300),
              Expanded(child: steppers.length > 1 ? steppers.last : const SizedBox.shrink()),
            ],
          ),
        if (r.maxRuns > 0 || r.allowsCaughtStealing)
          Wrap(
            spacing: Space.s200,
            children: [
              if (r.maxRuns > 0)
                FilterChip(
                  label: const Text('得点'),
                  selected: a.scored,
                  onSelected: r.minRuns > 0 ? null : store.setScored,
                ),
              if (r.allowsCaughtStealing)
                FilterChip(label: const Text('盗塁死'), selected: a.caughtStealing, onSelected: store.setCaughtStealing),
            ],
          ),
        if (r.maxRbi == 0 && r.maxSteals == 0 && r.maxRuns == 0)
          Text('${r.label}では打点も走塁も付きません。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ],
    );
  }
}

/// 結果の面。出塁を上、アウトを下に置き、見出しで分けて色だけに頼らない。
class _Pad extends StatelessWidget {
  const _Pad({required this.keys, required this.onPick});

  final Map<AtBatResult, GlobalKey> keys;
  final ValueChanged<AtBatResult> onPick;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget group(ResultGroup g) {
      final results = _mainResults.where((r) => r.group == g).toList();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: Space.s100),
            child: Text(g.label, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          ),
          LayoutBuilder(
            builder: (context, c) {
              final scale = MediaQuery.textScalerOf(context).scale(1);
              final columns = c.maxWidth / scale < 260 ? 2 : 3;
              final width = c.maxWidth / columns;
              return Wrap(
                children: [
                  for (final r in results)
                    SizedBox(
                      key: keys[r],
                      width: width,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: Space.s50),
                        child: KeyButton(
                          label: r.label,
                          fill: r == AtBatResult.homeRun
                              ? p.primary
                              : r.isOnBase
                              ? p.primaryContainer
                              : p.surface,
                          semanticsHint: '打席を足します',
                          oneLine: true,
                          onPressed: () => onPick(r),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        group(ResultGroup.onBase),
        const SizedBox(height: Space.s100),
        group(ResultGroup.out),
      ],
    );
  }
}

/// 犠打や敬遠など、面に並べない結果を選ぶ。
class _OtherResults extends StatelessWidget {
  const _OtherResults({required this.onPick});

  final ValueChanged<AtBatResult> onPick;

  @override
  Widget build(BuildContext context) => KeyButton(
    label: 'ほかの結果',
    icon: Icons.more_horiz,
    semanticsHint: '犠打や敬遠などを選べます',
    onPressed: () async {
      final picked = await pickResult(
        context,
        title: 'ほかの結果',
        results: AtBatResult.values.where((r) => !_mainResults.contains(r)).toList(),
      );
      if (picked != null) onPick(picked);
    },
  );
}

/* -------------------------------------------------------------------- 試合後 */

/// 試合後。勝敗を先に置き、打率と成績の桁を転がして差の札を跳ねさせる。
/// 操作（次の試合、選手トップ）は下端の帯に置き、最初から押せて動きを待たせない。記録達成のときだけ紙吹雪を舞わせる。
class _AfterGame extends StatelessWidget {
  const _AfterGame({super.key, required this.summary});

  final GameSummary summary;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final g = summary.game;
    final o = g.outcome!;
    final season = store.current!.current;
    final before = summary.seasonBefore;
    final after = summary.seasonAfter;
    String? intDelta(int now, int was) => now == was ? null : '+${now - was}';
    String? rateDelta(double? now, double? was) {
      if (now == null || was == null) return null;
      final d = now - was;
      return d.abs() < 0.0005 ? null : signedRate(d);
    }

    final tiles = [
      ('本塁打', after.homeRuns, before.homeRuns),
      ('打点', after.rbi, before.rbi),
      ('安打', after.hits, before.hits),
      ('盗塁', after.steals, before.steals),
    ];
    final avgDelta = rateDelta(after.average, before.average);
    final result = Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(
              liveRegion: true,
              label: '${g.myScore} 対 ${g.opponentScore} で${o.label}',
              excludeSemantics: true,
              child: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text('${g.myScore} 対 ${g.opponentScore} で', style: Txt.title),
                  Container(
                    margin: const EdgeInsets.only(left: Space.s100),
                    padding: const EdgeInsets.symmetric(horizontal: Space.s150),
                    color: o == GameOutcome.win ? p.primary : Colors.transparent,
                    child: Text(o.label, style: Txt.title.copyWith(color: o == GameOutcome.win ? p.onPrimary : p.onSurface)),
                  ),
                ],
              ),
            ),
            GameLine(game: g, dense: true),
            for (final m in summary.milestones)
              Padding(
                padding: const EdgeInsets.only(top: Space.s200),
                child: MilestoneBanner(text: m),
              ),
            const SizedBox(height: Space.s400),
            Text('打率', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: Space.s300,
              children: [
                AverageFigure(value: after.average, from: before.average),
                if (avgDelta != null)
                  DeltaChip(text: avgDelta, up: !avgDelta.startsWith('−'), delay: const Duration(milliseconds: 700)),
              ],
            ),
            const SizedBox(height: Space.s300),
            LayoutBuilder(
              builder: (context, c) {
                final scale = MediaQuery.textScalerOf(context).scale(1);
                final columns = c.maxWidth / scale < 300 ? 1 : 2;
                final width = (c.maxWidth - Space.s300 * (columns - 1) - Bold.shadow) / columns;
                return Wrap(
                  spacing: Space.s300,
                  runSpacing: Space.s300,
                  children: [
                    for (var i = 0; i < tiles.length; i++)
                      SizedBox(
                        width: width,
                        child: BoldBox(
                          padding: const EdgeInsets.all(Space.s300),
                          child: Semantics(
                            label: '${tiles[i].$1} ${tiles[i].$2}${intDelta(tiles[i].$2, tiles[i].$3) == null ? '' : '、${intDelta(tiles[i].$2, tiles[i].$3)}'}',
                            excludeSemantics: true,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tiles[i].$1, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                                Wrap(
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  spacing: Space.s200,
                                  children: [
                                    Odometer(
                                      value: tiles[i].$2,
                                      from: tiles[i].$3,
                                      digits: math.max(1, '${tiles[i].$2}'.length),
                                      style: Txt.figure,
                                      delay: Duration(milliseconds: 150 + 100 * i),
                                    ),
                                    if (intDelta(tiles[i].$2, tiles[i].$3) case final d?)
                                      DeltaChip(text: d, delay: Duration(milliseconds: 650 + 100 * i)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
            const SizedBox(height: Space.s400),
            Row(
              children: [
                Expanded(child: Text(year(season.year), style: Txt.control)),
                Text('${season.playedCount} / ${season.totalGames} 試合', style: Txt.control.merge(Txt.tabular)),
              ],
            ),
            const SizedBox(height: Space.s150),
            SeasonGrid(season: season, popLast: true),
            const SizedBox(height: Space.s200),
            SeasonGridLegend(season: season),
          ],
        ),
        if (summary.milestones.isNotEmpty) const Positioned.fill(child: PixelBurst(delay: Duration(milliseconds: 200))),
      ],
    );
    return result;
  }
}

/* ---------------------------------------------------------------------- 名鑑 */

enum _Filter {
  all('すべて'),
  active('現役'),
  retired('引退');

  const _Filter(this.label);
  final String label;
}

/// 名鑑。選手をドット絵の札で並べ、現役は開くと「この選手で続ける」を出す（shared の選手の詳細）。
class _Directory extends StatefulWidget {
  const _Directory();

  @override
  State<_Directory> createState() => _DirectoryState();
}

class _DirectoryState extends State<_Directory> with SingleTickerProviderStateMixin {
  late final _enter = AnimationController(vsync: this, duration: const Duration(milliseconds: 700), value: 1);
  _Filter _filter = _Filter.all;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !Motion.reduced(context)) _enter.forward(from: 0);
    });
  }

  @override
  void dispose() {
    _enter.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final players = store.players.where((pl) {
      return switch (_filter) {
        _Filter.all => true,
        _Filter.active => pl.isActive,
        _Filter.retired => !pl.isActive,
      };
    }).toList()..sort((a, b) => b.lastPlayedOrder.compareTo(a.lastPlayedOrder));
    return Scaffold(
      appBar: AppBar(title: const Text('名鑑')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
        children: [
          ChoiceWrap<_Filter>(
            semanticsLabel: '絞り込み',
            values: _Filter.values,
            label: (f) => f.label,
            isSelected: (f) => f == _filter,
            onSelected: (f) => setState(() => _filter = f),
          ),
          const SizedBox(height: Space.s400),
          LayoutBuilder(
            builder: (context, c) {
              final scale = MediaQuery.textScalerOf(context).scale(1);
              final columns = c.maxWidth / scale < 320 ? 2 : 3;
              final width = (c.maxWidth - Space.s200 * (columns - 1)) / columns - 0.5;
              final cards = [
                for (final pl in players) _MiniCard(player: pl, onTap: () => _open(context, pl)),
                if (store.canCreatePlayer && _filter != _Filter.retired)
                  KeyButton(label: '選手を作る', icon: Icons.add, dashed: true, height: 200, onPressed: () => openCreation(context)),
              ];
              return AnimatedBuilder(
                animation: _enter,
                builder: (context, _) => Wrap(
                  spacing: Space.s200,
                  runSpacing: Space.s200,
                  children: [
                    for (var i = 0; i < cards.length; i++)
                      SizedBox(
                        width: width,
                        child: Transform.scale(
                          // 左上から順に 40ms ずつ遅れて跳ねる。9 枚目以降は同時にし、待たせない。
                          scale: Curves.easeOutBack.transform(
                            ((_enter.value * 700 - math.min(i, 8) * 40) / 300).clamp(0.0, 1.0),
                          ),
                          child: cards[i],
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
          if (players.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: Space.s400),
              child: Text('当てはまる選手がいません。', style: Txt.ui.copyWith(color: Palette.of(context).onSurfaceVariant)),
            ),
        ],
      ),
    );
  }

  void _open(BuildContext context, Player pl) {
    openDetail(
      context,
      pl,
      onPlay: pl.isActive
          ? () {
              StoreScope.read(context).select(pl);
              Navigator.of(context).popUntil((r) => r.isFirst);
              _openTop(context);
            }
          : null,
    );
  }
}

/// 名鑑の 1 枠。球団の帯、ドット絵、名前、通算の成績。引退した選手は帯と帽子を灰にする。
class _MiniCard extends StatelessWidget {
  const _MiniCard({required this.player, required this.onTap});

  final Player player;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    final c = player.career;
    final band = player.isActive ? teamColor(s.team) : p.outline;
    return PressCard(
      label: '${player.name}、${player.isActive ? '現役' : '引退'}、${s.team.name}、通算 ${c.hits} 安打 ${c.homeRuns} 本',
      onTap: onTap,
      child: ExcludeSemantics(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(Radii.surface - Borders.thick),
          child: _body(p, s, c, band),
        ),
      ),
    );
  }

  Widget _body(Palette p, Season s, BattingLine c, Color band) {
    return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            color: band,
            padding: const EdgeInsets.symmetric(horizontal: Space.s200, vertical: Space.s50),
            child: Text(
              s.team.abbreviation,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Txt.caption.copyWith(color: inkOn(band), fontWeight: FontWeight.w700),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(Space.s200),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: PixelAvatar(player: player, size: 64)),
                const SizedBox(height: Space.s150),
                Text(player.name, style: Txt.control),
                Text(
                  player.isActive ? '現役・${player.proYears} 年目' : '引退',
                  style: Txt.caption.copyWith(color: p.onSurfaceVariant),
                ),
                Text('${c.hits} 安打', style: Txt.caption.merge(Txt.tabular)),
                Text('${c.homeRuns} 本塁打', style: Txt.caption.merge(Txt.tabular)),
              ],
            ),
          ),
        ],
      );
  }
}
