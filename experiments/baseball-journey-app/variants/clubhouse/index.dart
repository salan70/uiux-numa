import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/directory.dart';
import '../../shared/game_input.dart';
import '../../shared/nav.dart';
import '../../shared/player_detail.dart';
import '../../shared/settings.dart';
import '../../shared/store.dart';
import '../../shared/theme.dart';
import '../../shared/widgets.dart';

// clubhouse: 試合、記録、名鑑の 3 つを下端のタブに並べる。
// 仮説: 行き先を常に見せると、どの機能にも 1 回で届き、学ぶことが無い。
// 試合の入力は全画面に開き、保存したら「試合」のタブへ戻って直前の試合の差を見せる。

Widget buildVariant() => JourneyApp(home: (_) => const _Root());

enum _Tab {
  game('試合', Icons.sports_baseball_outlined, Icons.sports_baseball),
  record('記録', Icons.bar_chart_outlined, Icons.bar_chart),
  directory('名鑑', Icons.people_alt_outlined, Icons.people_alt);

  const _Tab(this.label, this.icon, this.selectedIcon);
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

class _Root extends StatefulWidget {
  const _Root();

  @override
  State<_Root> createState() => _RootState();
}

class _RootState extends State<_Root> {
  _Tab _tab = _Tab.game;

  /// 遊ぶ選手が替わったら（作成、名鑑から続ける）、試合のタブへ戻す。
  String? _playerId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _openLaunchRoute());
  }

  Future<void> _openLaunchRoute() async {
    final store = StoreScope.read(context);
    switch (store.options.route) {
      case 'record':
        setState(() => _tab = _Tab.record);
      case 'directory':
        setState(() => _tab = _Tab.directory);
      case 'input' || 'score':
        await _openInput(context, score: store.options.route == 'score');
      case 'afterGame':
        await store.saveGame(5, 2);
      default:
        if (mounted) openSharedRoute(context, store);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final player = store.current;
    if (player?.id != _playerId) {
      if (_playerId != null && player != null) _tab = _Tab.game;
      _playerId = player?.id;
    }
    if (player == null && _tab != _Tab.directory) return const _Welcome();
    return Scaffold(
      appBar: AppBar(
        title: Text(_tab == _Tab.game ? '試合' : _tab.label),
        actions: [
          if (_tab == _Tab.record && player != null) ShareAction(player: player),
          IconButton(tooltip: '設定', icon: const Icon(Icons.settings_outlined), onPressed: () => openSettings(context)),
        ],
      ),
      body: switch (_tab) {
        _Tab.game => const _GameTab(),
        _Tab.record => PlayerDetailBody(player: player!),
        _Tab.directory => DirectoryBody(
          onOpen: (p) async {
            await openFromDirectory(context, p);
          },
          onCreate: () => openCreation(context),
        ),
      },
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab.index,
        onDestinationSelected: (i) => setState(() => _tab = _Tab.values[i]),
        destinations: [
          for (final t in _Tab.values)
            NavigationDestination(icon: Icon(t.icon), selectedIcon: Icon(t.selectedIcon), label: t.label),
        ],
      ),
    );
  }
}

/// 遊んでいる選手がいない。初回はここが遊び方を兼ねる。
class _Welcome extends StatelessWidget {
  const _Welcome();

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(tooltip: '設定', icon: const Icon(Icons.settings_outlined), onPressed: () => openSettings(context)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s1000),
        children: [
          Semantics(header: true, child: const Text('Baseball Player Journey', style: Txt.title)),
          const SizedBox(height: Space.s200),
          const Text('架空の選手を作り、1 試合ずつ記録して、あなただけの名鑑を作ります。', style: Txt.body),
          const SectionTitle('遊び方'),
          const HowToPlay(),
          const SizedBox(height: Space.s400),
          PressButton(label: '選手を作る', kind: PressKind.primary, onPressed: () => openCreation(context)),
          if (store.players.isNotEmpty) ...[
            const SizedBox(height: Space.s300),
            PressButton(
              label: '名鑑',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => Scaffold(
                    appBar: AppBar(title: const Text('名鑑')),
                    body: DirectoryBody(
                      onOpen: (p) => openFromDirectory(context, p),
                      onCreate: () => openCreation(context),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _GameTab extends StatelessWidget {
  const _GameTab();

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final player = store.current!;
    final season = player.current;
    final summary = store.lastSummary;
    return ListView(
      padding: const EdgeInsets.fromLTRB(Space.page, Space.s100, Space.page, Space.s1000),
      children: [
        PlayerHeader(player: player, compact: true),
        const SizedBox(height: Space.s400),
        if (summary != null) ...[_SavedGame(summary: summary), const SizedBox(height: Space.s400)],
        Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SeasonProgress(season: season),
              const SizedBox(height: Space.s400),
              if (season.isComplete) ...[
                Text('全 ${season.totalGames} 試合を終えました。', style: Txt.body),
                const SizedBox(height: Space.s300),
                PressButton(
                  label: 'シーズンを終える',
                  kind: PressKind.primary,
                  onPressed: () => openSeasonEnd(context, player),
                ),
              ] else
                PressButton(
                  label: '第 ${season.playedCount + 1} 戦へ',
                  kind: PressKind.primary,
                  semanticsHint: '出場のしかたを選びます',
                  onPressed: () async {
                    final choice = await showParticipationSheet(context, player);
                    if (choice == null || !context.mounted) return;
                    if (applyChoice(store, choice)) await _openInput(context);
                  },
                ),
            ],
          ),
        ),
        SectionTitle('${season.year} 年の成績'),
        SeasonStatGrid(line: season.line),
        SectionTitle(
          '最近の試合',
          trailing: TextButton(onPressed: () => openHistory(context, player), child: const Text('すべて')),
        ),
        if (season.games.isEmpty)
          Text('まだ試合がありません。', style: Txt.ui.copyWith(color: p.onSurfaceVariant))
        else
          for (final g in season.games.reversed.take(5)) GameLine(game: g),
      ],
    );
  }
}

/// 保存した直後の試合。差の札で伸びを見せる。スナックバーを使わない（ui_ux_concepts.md 8.6）。
class _SavedGame extends StatelessWidget {
  const _SavedGame({required this.summary});

  final GameSummary summary;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final o = summary.game.outcome;
    return Panel(
      color: p.primaryContainer,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Semantics(
                  liveRegion: true,
                  child: Text(
                    '第 ${summary.game.number} 戦を保存しました。${o == null ? '' : '${summary.game.myScore} 対 ${summary.game.opponentScore} で${o.label}。'}',
                    style: Txt.control,
                  ),
                ),
              ),
              IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: store.dismissSummary),
            ],
          ),
          for (final m in summary.milestones)
            Padding(
              padding: const EdgeInsets.only(bottom: Space.s200),
              child: MilestoneBanner(text: m),
            ),
          GameLine(game: summary.game, dense: true),
          const SizedBox(height: Space.s300),
          SeasonStatGrid(line: summary.seasonAfter, before: summary.seasonBefore, large: false),
        ],
      ),
    );
  }
}

Future<void> _openInput(BuildContext context, {bool score = false}) {
  return Navigator.of(context)
      .push(MaterialPageRoute<void>(fullscreenDialog: true, builder: (_) => _GameInputPage(openScore: score)));
}

class _GameInputPage extends StatefulWidget {
  const _GameInputPage({this.openScore = false});

  final bool openScore;

  @override
  State<_GameInputPage> createState() => _GameInputPageState();
}

class _GameInputPageState extends State<_GameInputPage> {
  @override
  void initState() {
    super.initState();
    if (widget.openScore) WidgetsBinding.instance.addPostFrameCallback((_) => _finish());
  }

  Future<void> _finish() async {
    final saved = await showScoreSheet(context);
    if (saved && mounted) Navigator.pop(context);
  }

  Future<void> _close() async {
    if (await confirmDiscard(context) && mounted) {
      StoreScope.read(context).discardGame();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final d = store.draft;
    if (d == null) return const Scaffold();
    final season = store.current!.current;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _close();
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: _close),
          title: Text('第 ${season.playedCount + 1} 戦'),
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s300),
                children: [
                  Wrap(
                    spacing: Space.s300,
                    children: [
                      Text(d.participation.label, style: Txt.control),
                      Semantics(
                        liveRegion: true,
                        child: Text(d.line, style: Txt.ui.merge(Txt.tabular).copyWith(color: p.onSurfaceVariant)),
                      ),
                    ],
                  ),
                  const SizedBox(height: Space.s200),
                  const AtBatStrip(),
                  const SizedBox(height: Space.s200),
                  const AtBatEditor(),
                ],
              ),
            ),
            InputDock(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ResultPad(onPick: store.addResult),
                  const SizedBox(height: Space.s300),
                  GameActionBar(onFinish: _finish),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
