import 'package:flutter/material.dart';

import '../../shared/app.dart';
import '../../shared/directory.dart';
import '../../shared/format.dart';
import '../../shared/game_input.dart';
import '../../shared/model.dart';
import '../../shared/nav.dart';
import '../../shared/store.dart';
import '../../shared/theme.dart';
import '../../shared/widgets.dart';

// matchday: タイトル画面から入り、選手トップで今季を見てから、1 試合を 1 画面で記録する。
// 仮説: 画面の主役を「今日の試合」だけにし、試合後に伸びを見せると、短い時間でも 1 試合ごとに手応えがある。
// round 2 で、clubhouse の試合前の画面を選手トップとして取り込んだ（README の反復の記録）。
// 名鑑、記録、設定は右上のメニューに下げる。入力の途中で選手トップやメニューへ行っても、入力は残る。

Widget buildVariant() => JourneyApp(home: (_) => const _Title());

/// タイトル画面（title.md）。懐かしさの入口として残し、続きからの選手名を先に見せる。
class _Title extends StatefulWidget {
  const _Title();

  @override
  State<_Title> createState() => _TitleState();
}

class _TitleState extends State<_Title> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
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
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final player = store.current;
    return Scaffold(
      body: SafeArea(
        // 文字を拡大して収まらないときはスクロールさせる。収まるときは余白を上下に分ける。
        child: LayoutBuilder(
          builder: (context, c) => SingleChildScrollView(
            padding: const EdgeInsets.all(Space.s600),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: c.maxHeight - Space.s600 * 2),
              child: IntrinsicHeight(child: _titleColumn(context, store, p, player)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _titleColumn(BuildContext context, AppStore store, Palette p, Player? player) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Spacer(),
        Semantics(header: true, label: 'Baseball Player Journey', excludeSemantics: true, child: _Logo()),
        const Spacer(),
        if (player != null) ...[
          PressButton(label: 'つづきから', kind: PressKind.primary, onPressed: () => _openTop(context)),
          Padding(
            padding: const EdgeInsets.only(top: Space.s100, bottom: Space.s300),
            child: Text(
              '${player.name}・${year(player.current.year)} 第 ${player.current.playedCount + 1} 戦から',
              textAlign: TextAlign.center,
              style: Txt.caption.copyWith(color: p.onSurfaceVariant),
            ),
          ),
        ],
        PressButton(
          label: '選手を作る',
          kind: player == null ? PressKind.primary : PressKind.secondary,
          onPressed: store.canCreatePlayer ? () => openCreation(context) : null,
        ),
        const SizedBox(height: Space.s300),
        Row(
          children: [
            Expanded(
              child: PressButton(label: '名鑑', onPressed: store.players.isEmpty ? null : () => _openDirectory(context)),
            ),
            const SizedBox(width: Space.s300),
            Expanded(
              child: PressButton(label: '設定', onPressed: () => openSettings(context)),
            ),
          ],
        ),
        if (player == null) ...[
          const SizedBox(height: Space.s400),
          Text(
            'まだ選手がいません。選手を作ると、1 試合ずつ記録できます。',
            textAlign: TextAlign.center,
            style: Txt.ui.copyWith(color: p.onSurfaceVariant),
          ),
        ],
      ],
    );
  }
}

/// 題字。ボールの印と 2 段の文字で組む。
class _Logo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Column(
      children: [
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            color: p.primary,
            shape: BoxShape.circle,
            border: Border.all(color: p.ink, width: 3),
            boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(4, 4))],
          ),
          child: Icon(Icons.sports_baseball, size: 56, color: p.onPrimary),
        ),
        const SizedBox(height: Space.s400),
        Text('BASEBALL PLAYER', style: Txt.heading.copyWith(letterSpacing: 2)),
        Text('JOURNEY', style: Txt.figure.copyWith(fontSize: 44, letterSpacing: 4)),
      ],
    );
  }
}

void _openDirectory(BuildContext context) {
  Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => Scaffold(
        appBar: AppBar(title: const Text('名鑑')),
        body: DirectoryBody(
          onOpen: (p) => openDetail(
            context,
            p,
            onPlay: p.isActive
                ? () {
                    StoreScope.read(context).select(p);
                    Navigator.of(context).popUntil((r) => r.isFirst);
                    _openTop(context);
                  }
                : null,
          ),
          onCreate: () => openCreation(context),
        ),
      ),
    ),
  );
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

class _Matchday extends StatelessWidget {
  const _Matchday();

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final player = store.current;
    if (player == null) return const Scaffold();
    final season = player.current;
    final draft = store.draft;
    final summary = store.lastSummary;
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
            _AfterGame(summary: summary)
          else if (draft != null) ...[
            const AtBatStrip(),
            const AtBatEditor(),
          ] else if (season.isComplete) ...[
            Text('${year(season.year)}の全 ${season.totalGames} 試合を終えました。', style: Txt.body),
            const SizedBox(height: Space.s300),
            PressButton(label: '選手トップへ', kind: PressKind.primary, onPressed: () => Navigator.of(context).pop()),
          ] else ...[
            Semantics(header: true, child: const Text('今日の出場', style: Txt.heading)),
            const SizedBox(height: Space.s300),
            ParticipationForm(player: player, onDecided: (c) => applyChoice(store, c)),
          ],
        ],
      ),
      bottomNavigationBar: draft == null
          ? null
          : InputDock(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ResultPad(onPick: store.addResult),
                  const SizedBox(height: Space.s300),
                  GameActionBar(onFinish: () => showScoreSheet(context)),
                ],
              ),
            ),
    );
  }
}

/// 電光掲示板。試合の番号、進み、今日の成績を 1 枚にする。明暗どちらでも暗い面にする。
class _Scoreboard extends StatelessWidget {
  const _Scoreboard({required this.player, required this.draft});

  final Player player;
  final GameDraft? draft;

  static const _board = Color(0xFF1E3A2B);
  static const _boardInk = Color(0xFFF4F1E6);
  static const _boardLamp = Color(0xFFFAC400);

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    final line = s.line;
    final number = s.isComplete ? s.totalGames : s.playedCount + 1;
    return Container(
      padding: const EdgeInsets.all(Space.s400),
      decoration: BoxDecoration(
        color: _board,
        borderRadius: BorderRadius.circular(Radii.surface),
        border: Border.all(color: p.ink, width: Borders.thick),
      ),
      child: DefaultTextStyle.merge(
        style: const TextStyle(color: _boardInk),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Wrap(
                    spacing: Space.s200,
                    crossAxisAlignment: WrapCrossAlignment.end,
                    children: [
                      Text('第 $number 戦', style: Txt.figure.copyWith(color: _boardLamp)),
                      Padding(
                        padding: const EdgeInsets.only(bottom: Space.s100),
                        child: Text('/ ${s.totalGames}', style: Txt.ui.merge(Txt.tabular).copyWith(color: _boardInk)),
                      ),
                    ],
                  ),
                ),
                JerseyBadge(s.uniformNumber, size: 44),
              ],
            ),
            Text(
              '${year(s.year)}・${s.team.name}・${player.mainPosition.label}',
              style: Txt.caption.copyWith(color: _boardInk),
            ),
            const SizedBox(height: Space.s300),
            Semantics(
              liveRegion: draft != null,
              child: Text(
                draft == null
                    ? '今季 ${rate(line.average)}  ${line.homeRuns} 本  ${line.rbi} 打点  ${line.steals} 盗塁'
                    : '今日 ${draft!.participation.label}  ${draft!.line}',
                style: Txt.control.merge(Txt.tabular).copyWith(color: _boardInk),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 試合後の 1 枚。勝敗、節目、今季の成績の差を順に出す。動きの抑制では一度に出す。
class _AfterGame extends StatelessWidget {
  const _AfterGame({required this.summary});

  final GameSummary summary;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final g = summary.game;
    final o = g.outcome!;
    final season = store.current!.current;
    final parts = <Widget>[
      Semantics(
        liveRegion: true,
        child: Text(
          '${g.myScore} 対 ${g.opponentScore} で${o.label}',
          style: Txt.title.copyWith(color: o == GameOutcome.win ? p.success : p.onSurface),
        ),
      ),
      GameLine(game: g, dense: true),
      for (final m in summary.milestones) MilestoneBanner(text: m),
      Text('今季の成績', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      SeasonStatGrid(line: summary.seasonAfter, before: summary.seasonBefore),
      // 続けて遊ぶなら次の試合、区切るなら選手トップ。全試合の後はシーズンの終了がある選手トップだけにする。
      if (!season.isComplete)
        PressButton(label: '第 ${season.playedCount + 1} 戦へ', kind: PressKind.primary, onPressed: store.dismissSummary),
      PressButton(
        label: '選手トップへ',
        kind: season.isComplete ? PressKind.primary : PressKind.secondary,
        onPressed: () => Navigator.of(context).pop(),
      ),
    ];
    final reduced = Motion.reduced(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < parts.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: Space.s300),
            child: reduced ? parts[i] : _Rise(delay: Motion.stagger * i, child: parts[i]),
          ),
      ],
    );
  }
}

/// 下から少し浮き上がって現れる。押し先の位置は、出そろった後で変わらない。
class _Rise extends StatefulWidget {
  const _Rise({required this.delay, required this.child});

  final Duration delay;
  final Widget child;

  @override
  State<_Rise> createState() => _RiseState();
}

class _RiseState extends State<_Rise> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(vsync: this, duration: Motion.entrance);

  @override
  void initState() {
    super.initState();
    Future.delayed(widget.delay, () {
      if (mounted) _c.forward();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = CurvedAnimation(parent: _c, curve: Motion.entranceCurve);
    return FadeTransition(
      opacity: t,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.15), end: Offset.zero).animate(t),
        child: widget.child,
      ),
    );
  }
}

/// 選手トップ（play_top.md）。試合の前に今季の進み、成績、能力、最近の試合を見て、次の試合へ進む。
/// 主な操作は親指の届く下端に置き、試合の数ほど押す「次の試合へ」を毎回同じ位置にする。
class _PlayerTop extends StatelessWidget {
  const _PlayerTop();

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
          _PlayerBoard(player: player),
          if (draft != null) ...[
            const SizedBox(height: Space.s400),
            Panel(
              color: p.secondaryContainer,
              child: Text(
                '第 ${season.playedCount + 1} 戦を入力しています。${draft.line}。',
                style: Txt.control.copyWith(color: p.onSecondaryContainer),
              ),
            ),
          ] else if (summary != null) ...[
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
          SectionTitle('${year(season.year)}の成績'),
          SeasonStatGrid(line: season.line, before: summary?.seasonBefore),
          SectionTitle(
            '能力',
            trailing: TextButton(onPressed: () => openDetail(context, player), child: const Text('記録')),
          ),
          _AbilityStrip(abilities: season.abilities),
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
      content = PressButton(
        label: '第 ${season.playedCount + 1} 戦の入力に戻る',
        kind: PressKind.primary,
        onPressed: () => _openMatchday(context),
      );
    } else if (season.isComplete) {
      content = PressButton(
        label: 'シーズンを終える',
        kind: PressKind.primary,
        onPressed: () async {
          // 終えた後はタイトルまで戻るので、次の季へ進んだら選手トップを開き直す。引退したらタイトルに留まる。
          final navigator = Navigator.of(context);
          final retired = await openSeasonEnd(context, player);
          if (!retired) navigator.push(MaterialPageRoute<void>(builder: (_) => const _PlayerTop()));
        },
      );
    } else {
      content = Row(
        children: [
          Expanded(
            child: PressButton(
              label: '欠場で進める',
              semanticsHint: '出場しない試合の数を選びます',
              onPressed: () async {
                final choice = await showParticipationSheet(context, player, initialKind: ParticipationKind.none);
                if (choice != null) applyChoice(store, choice);
              },
            ),
          ),
          const SizedBox(width: Space.s300),
          Expanded(
            child: PressButton(
              label: '第 ${season.playedCount + 1} 戦へ',
              kind: PressKind.primary,
              semanticsHint: '出場のしかたを選んで、試合を記録します',
              onPressed: () {
                store.dismissSummary();
                _openMatchday(context);
              },
            ),
          ),
        ],
      );
    }
    return Container(
      decoration: BoxDecoration(
        color: p.background,
        border: Border(top: BorderSide(color: p.surfaceVariant)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s300),
          child: content,
        ),
      ),
    );
  }
}

/// 選手の札。試合画面の電光掲示板と同じ面で、背番号、名前、今季の進みを 1 枚にする。
class _PlayerBoard extends StatelessWidget {
  const _PlayerBoard({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    const ink = _Scoreboard._boardInk;
    return Semantics(
      container: true,
      child: Container(
        padding: const EdgeInsets.all(Space.s400),
        decoration: BoxDecoration(
          color: _Scoreboard._board,
          borderRadius: BorderRadius.circular(Radii.surface),
          border: Border.all(color: p.ink, width: Borders.thick),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                JerseyBadge(s.uniformNumber),
                const SizedBox(width: Space.s300),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Semantics(
                        header: true,
                        child: Text(player.name, style: Txt.title.copyWith(color: ink)),
                      ),
                      Text(
                        '${s.team.name}・${player.mainPosition.label}・${player.handedness}',
                        style: Txt.caption.copyWith(color: ink),
                      ),
                      Text('${player.age} 歳・プロ ${player.proYears} 年目', style: Txt.caption.copyWith(color: ink)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: Space.s400),
            Semantics(
              label: '${year(s.year)}、${s.totalGames} 試合のうち ${s.playedCount} 試合を終えました',
              excludeSemantics: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    children: [
                      Text(year(s.year), style: Txt.control.copyWith(color: ink)),
                      Text(
                        '${s.playedCount} / ${s.totalGames} 試合',
                        style: Txt.control.merge(Txt.tabular).copyWith(color: _Scoreboard._boardLamp),
                      ),
                    ],
                  ),
                  const SizedBox(height: Space.s150),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(Radii.pill),
                    child: LinearProgressIndicator(
                      value: s.playedCount / s.totalGames,
                      minHeight: 8,
                      color: _Scoreboard._boardLamp,
                      backgroundColor: ink.withValues(alpha: 0.2),
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

/// 能力の札の並び。名前、ランク、数を 1 枚に入れ、横に折り返す（play_top.md の能力 3〜10 項目）。
class _AbilityStrip extends StatelessWidget {
  const _AbilityStrip({required this.abilities});

  final List<Ability> abilities;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Wrap(
      spacing: Space.s200,
      runSpacing: Space.s200,
      children: [
        for (final a in abilities)
          Semantics(
            label: '${a.name} ${a.rank} ${a.value}',
            excludeSemantics: true,
            child: Container(
              constraints: const BoxConstraints(minWidth: 84),
              padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s200),
              decoration: BoxDecoration(
                color: p.surface,
                borderRadius: BorderRadius.circular(Radii.control),
                border: Border.all(color: p.outline, width: Borders.thick),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(a.name, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(a.rank, style: Txt.figureSm),
                      const SizedBox(width: Space.s150),
                      Text('${a.value}', style: Txt.caption.merge(Txt.tabular)),
                    ],
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
