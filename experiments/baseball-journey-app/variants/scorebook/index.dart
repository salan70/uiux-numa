import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/directory.dart';
import '../../shared/format.dart';
import '../../shared/game_input.dart';
import '../../shared/model.dart';
import '../../shared/nav.dart';
import '../../shared/settings.dart';
import '../../shared/store.dart';
import '../../shared/theme.dart';
import '../../shared/widgets.dart';

// scorebook: 選手の経歴と試合を 1 本の帳面にする。下へ行くほど新しく、最下段に次の試合の行を常設する。
// 仮説: 記録することが「帳面の次の行を書く」ことになり、振り返りに画面の移動が要らない。
// 入力中の打席は帳面の最後の行に書き込まれ、下端の入力面は結果を押す場所だけになる。

Widget buildVariant() => JourneyApp(home: (_) => const _Root());

class _Root extends StatefulWidget {
  const _Root();

  @override
  State<_Root> createState() => _RootState();
}

class _RootState extends State<_Root> {
  /// 下端で出場のしかたを選んでいる。
  bool _choosing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final store = StoreScope.read(context);
      switch (store.options.route) {
        case 'directory':
          _openDirectory(context);
        case 'record' when store.current != null:
          openDetail(context, store.current!);
        case 'choose':
          setState(() => _choosing = true);
        case 'score':
          showScoreSheet(context);
        case 'afterGame':
          await store.saveGame(5, 2);
        default:
          openSharedRoute(context, store);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final player = store.current;
    if (player == null) return _Welcome(onDirectory: () => _openDirectory(context));
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (_choosing) setState(() => _choosing = false);
      },
      child: Scaffold(
        appBar: AppBar(
          centerTitle: false,
          titleSpacing: Space.page,
          title: Semantics(
            button: true,
            hint: '名鑑でほかの選手を選べます',
            child: InkWell(
              onTap: () => _openDirectory(context),
              borderRadius: BorderRadius.circular(Radii.control),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: Space.s100),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(child: Text(player.name, overflow: TextOverflow.ellipsis)),
                    const Icon(Icons.expand_more),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            IconButton(tooltip: '記録', icon: const Icon(Icons.bar_chart), onPressed: () => openDetail(context, player)),
            IconButton(
              tooltip: '設定',
              icon: const Icon(Icons.settings_outlined),
              onPressed: () => openSettings(context),
            ),
          ],
        ),
        body: _Ledger(player: player),
        bottomNavigationBar: _Dock(player: player, choosing: _choosing, onChoose: (v) => setState(() => _choosing = v)),
      ),
    );
  }
}

void _openDirectory(BuildContext context) {
  Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => Scaffold(
        appBar: AppBar(title: const Text('名鑑')),
        body: DirectoryBody(onOpen: (p) => openFromDirectory(context, p), onCreate: () => openCreation(context)),
      ),
    ),
  );
}

class _Welcome extends StatelessWidget {
  const _Welcome({required this.onDirectory});

  final VoidCallback onDirectory;

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
          Semantics(header: true, child: const Text('白紙の帳面', style: Txt.title)),
          const SizedBox(height: Space.s200),
          const Text('選手を作ると、入団の日から帳面が始まります。1 試合ごとに 1 行ずつ書き足します。', style: Txt.body),
          const SectionTitle('遊び方'),
          const HowToPlay(),
          const SizedBox(height: Space.s400),
          PressButton(label: '選手を作る', kind: PressKind.primary, onPressed: () => openCreation(context)),
          if (store.players.isNotEmpty) ...[
            const SizedBox(height: Space.s300),
            PressButton(label: '名鑑', onPressed: onDirectory),
          ],
        ],
      ),
    );
  }
}

/// 帳面。reverse で最下段（最新）から始め、上へ遡る。
class _Ledger extends StatelessWidget {
  const _Ledger({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final season = player.current;
    final draft = store.draft;
    final summary = store.lastSummary;
    final games = season.games.reversed.toList();
    // reverse の ListView なので、先頭が画面の最下段になる。
    final items = <Widget>[
      if (draft != null) _DraftLine(number: season.playedCount + 1, draft: draft),
      for (final g in games) _LedgerGame(game: g, fresh: summary != null && summary.game.number == g.number),
      _SeasonHead(season: season, current: true),
      for (final s in player.seasons.reversed.skip(1)) _PastSeason(season: s),
      _Origin(player: player),
    ];
    return ListView.builder(
      reverse: true,
      padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s300),
      itemCount: items.length,
      itemBuilder: (_, i) => items[i],
    );
  }
}

class _Origin extends StatelessWidget {
  const _Origin({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final o = player.origin;
    final route = o.draftRound == null ? o.route.label : '${o.route.label} ${o.draftRound} 位';
    return Padding(
      padding: const EdgeInsets.only(bottom: Space.s400),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${year(o.joiningYear)}・入団', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          Text('${player.seasons.first.team.name}に$routeで入団した。', style: Txt.body),
          if (o.memo != null) Text(o.memo!, style: Txt.body.copyWith(color: p.onSurfaceVariant)),
        ],
      ),
    );
  }
}

/// 終わった季。1 行の要約と、タイトル、移籍を載せる。押すとその季の試合を開く。
class _PastSeason extends StatelessWidget {
  const _PastSeason({required this.season});

  final Season season;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final l = season.line;
    return Padding(
      padding: const EdgeInsets.only(bottom: Space.s300),
      child: PressCard(
        label: '${season.year} 年の試合を開く',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => Scaffold(
              appBar: AppBar(title: Text('${year(season.year)}の試合')),
              body: ListView(
                padding: const EdgeInsets.all(Space.page),
                children: [for (final g in season.games.reversed) GameLine(game: g)],
              ),
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(Space.s300),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(year(season.year), style: Txt.control),
                  const SizedBox(width: Space.s200),
                  Expanded(
                    child: Text(
                      season.transferred ? '${season.team.name}へ移籍' : season.team.name,
                      style: Txt.caption.copyWith(color: p.onSurfaceVariant),
                    ),
                  ),
                  Icon(Icons.chevron_right, color: p.onSurfaceVariant),
                ],
              ),
              Text(
                '${l.games} 試合 ${rate(l.average)} ${l.homeRuns} 本 ${l.rbi} 打点 ${l.steals} 盗塁',
                style: Txt.ui.merge(Txt.tabular),
              ),
              if (season.titles.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: Space.s100),
                  child: Wrap(
                    spacing: Space.s100,
                    runSpacing: Space.s100,
                    children: [for (final t in season.titles) _TitleTag(t)],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TitleTag extends StatelessWidget {
  const _TitleTag(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Space.s150, vertical: Space.s50),
      decoration: BoxDecoration(color: p.tertiaryContainer, borderRadius: BorderRadius.circular(Radii.control)),
      child: Text(text, style: Txt.caption.copyWith(color: p.onTertiaryContainer)),
    );
  }
}

/// 今の季の見出し。この下に試合の行が続く。
class _SeasonHead extends StatelessWidget {
  const _SeasonHead({required this.season, required this.current});

  final Season season;
  final bool current;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: Space.s300, bottom: Space.s300),
      child: Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(
              header: true,
              child: Text('${year(season.year)}・${season.team.name}・背番号 ${season.uniformNumber}', style: Txt.control),
            ),
            const SizedBox(height: Space.s200),
            SeasonProgress(season: season),
            const SizedBox(height: Space.s300),
            SeasonStatGrid(line: season.line, large: false),
          ],
        ),
      ),
    );
  }
}

/// 帳面の試合の行。書いたばかりの行は面の色が引いていく（入口の動き 900ms）。
class _LedgerGame extends StatelessWidget {
  const _LedgerGame({required this.game, required this.fresh});

  final GameRecord game;
  final bool fresh;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    if (!fresh) return GameLine(game: game);
    final store = StoreScope.of(context);
    final summary = store.lastSummary!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 1, end: Motion.reduced(context) ? 1 : 0),
          duration: Motion.entrance,
          curve: Motion.entranceCurve,
          builder: (context, t, child) => DecoratedBox(
            decoration: BoxDecoration(color: Color.lerp(p.background, p.primaryContainer, 0.4 + 0.6 * t)),
            child: child,
          ),
          child: GameLine(game: game),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: Space.s200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final m in summary.milestones)
                Padding(
                  padding: const EdgeInsets.only(bottom: Space.s200),
                  child: MilestoneBanner(text: m),
                ),
              Semantics(
                liveRegion: true,
                child: Text('書きました。${_deltaLine(summary)}', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

String _deltaLine(GameSummary s) {
  final before = s.seasonBefore.average;
  final after = s.seasonAfter.average;
  final avg = before == null || after == null ? '' : '打率 ${rate(before)} → ${rate(after)}';
  return avg;
}

/// 入力中の行。帳面の最後の行として、打席を押して直せる。
class _DraftLine extends StatelessWidget {
  const _DraftLine({required this.number, required this.draft});

  final int number;
  final GameDraft draft;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      margin: const EdgeInsets.only(top: Space.s200),
      padding: const EdgeInsets.all(Space.s300),
      decoration: BoxDecoration(
        color: p.surface,
        borderRadius: BorderRadius.circular(Radii.surface),
        border: Border.all(color: p.secondary, width: Borders.thick),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: Space.s200,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text('第 $number 戦', style: Txt.control),
              Text(draft.participation.label, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
              Semantics(liveRegion: true, child: Text(draft.line, style: Txt.caption.merge(Txt.tabular))),
            ],
          ),
          const SizedBox(height: Space.s200),
          const AtBatStrip(),
          const AtBatEditor(),
        ],
      ),
    );
  }
}

/// 下端の入力面。何もしていない間は 1 行、書く間は結果の格子になる。
class _Dock extends StatelessWidget {
  const _Dock({required this.player, required this.choosing, required this.onChoose});

  final Player player;
  final bool choosing;
  final ValueChanged<bool> onChoose;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final season = player.current;
    final draft = store.draft;
    Widget content;
    if (draft != null) {
      content = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ResultPad(onPick: store.addResult),
          const SizedBox(height: Space.s300),
          Row(
            children: [
              IconButton(
                tooltip: '書くのをやめる',
                icon: const Icon(Icons.close),
                onPressed: () async {
                  if (await confirmDiscard(context)) store.discardGame();
                },
              ),
              const SizedBox(width: Space.s200),
              Expanded(child: GameActionBar(onFinish: () => showScoreSheet(context))),
            ],
          ),
        ],
      );
    } else if (season.isComplete) {
      content = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('${year(season.year)}の全 ${season.totalGames} 試合を書きました。', style: Txt.ui),
          const SizedBox(height: Space.s200),
          PressButton(label: 'シーズンを終える', kind: PressKind.primary, onPressed: () => openSeasonEnd(context, player)),
        ],
      );
    } else if (choosing) {
      content = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(child: Text('第 ${season.playedCount + 1} 戦', style: Txt.heading)),
              TextButton(onPressed: () => onChoose(false), child: const Text('閉じる')),
            ],
          ),
          const SizedBox(height: Space.s200),
          ParticipationForm(
            player: player,
            onDecided: (c) {
              onChoose(false);
              applyChoice(store, c);
            },
          ),
        ],
      );
    } else {
      content = PressButton(
        label: '第 ${season.playedCount + 1} 戦を書く',
        kind: PressKind.primary,
        icon: Icons.edit,
        semanticsHint: '出場のしかたを選びます',
        onPressed: () => onChoose(true),
      );
    }
    return InputDock(
      child: AnimatedSize(
        duration: Motion.reduced(context) ? Duration.zero : Motion.press,
        curve: Motion.out,
        alignment: Alignment.bottomCenter,
        child: content,
      ),
    );
  }
}
