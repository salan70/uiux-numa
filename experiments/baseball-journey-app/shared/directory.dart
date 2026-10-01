import 'package:flutter/material.dart';

import 'format.dart';
import 'model.dart';
import 'parts.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 選手名鑑（player_directory.md）と選手選択（save_select.md）を 1 つにした。
// 製品ではセーブデータと選手が別の画面にあるが、実体はどちらも選手で、置き場を 1 つにする（Information Architecture）。
// 現役の選手を開くと「この選手で続ける」を出し、引退した選手は見るだけにする。
// 1 ページ 20 人の送りは置かない。数十人は 1〜2 画面のスクロールに収まり、送りより絞り込みが効くため。

enum DirectoryFilter {
  all('すべて'),
  active('現役'),
  retired('引退');

  const DirectoryFilter(this.label);
  final String label;
}

enum DirectorySort {
  recent('最近遊んだ順'),
  hits('通算安打'),
  homeRuns('通算本塁打'),
  average('通算打率');

  const DirectorySort(this.label);
  final String label;
}

class DirectoryBody extends StatefulWidget {
  const DirectoryBody({super.key, required this.onOpen, required this.onCreate, this.header});

  final ValueChanged<Player> onOpen;
  final VoidCallback onCreate;
  final Widget? header;

  @override
  State<DirectoryBody> createState() => _DirectoryBodyState();
}

class _DirectoryBodyState extends State<DirectoryBody> {
  DirectoryFilter _filter = DirectoryFilter.all;
  DirectorySort _sort = DirectorySort.recent;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final players = store.players.where((pl) {
      return switch (_filter) {
        DirectoryFilter.all => true,
        DirectoryFilter.active => pl.isActive,
        DirectoryFilter.retired => !pl.isActive,
      };
    }).toList();
    players.sort(
      (a, b) => switch (_sort) {
        DirectorySort.recent => b.lastPlayedOrder.compareTo(a.lastPlayedOrder),
        DirectorySort.hits => b.career.hits.compareTo(a.career.hits),
        DirectorySort.homeRuns => b.career.homeRuns.compareTo(a.career.homeRuns),
        DirectorySort.average => (b.career.average ?? 0).compareTo(a.career.average ?? 0),
      },
    );
    if (store.players.isEmpty) {
      return EmptyState(
        message: 'まだ選手がいません。最初の 1 人を作ると、ここに並びます。',
        action: PressButton(label: '選手を作る', kind: PressKind.primary, expand: false, onPressed: widget.onCreate),
      );
    }
    return ListView(
      padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
      children: [
        ?widget.header,
        Row(
          children: [
            Expanded(
              child: ChoiceWrap<DirectoryFilter>(
                semanticsLabel: '絞り込み',
                values: DirectoryFilter.values,
                label: (f) => f.label,
                isSelected: (f) => f == _filter,
                onSelected: (f) => setState(() => _filter = f),
              ),
            ),
          ],
        ),
        const SizedBox(height: Space.s200),
        Row(
          children: [
            Text('並び', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            const SizedBox(width: Space.s200),
            DropdownButton<DirectorySort>(
              value: _sort,
              underline: const SizedBox.shrink(),
              style: Txt.control.copyWith(color: p.onSurface),
              items: [for (final s in DirectorySort.values) DropdownMenuItem(value: s, child: Text(s.label))],
              onChanged: (s) => setState(() => _sort = s ?? _sort),
            ),
            const Spacer(),
            Text('${players.length} 人', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          ],
        ),
        const SizedBox(height: Space.s200),
        for (final pl in players)
          Padding(
            padding: const EdgeInsets.only(bottom: Space.s200),
            child: PlayerRow(player: pl, current: pl.id == store.currentId, onTap: () => widget.onOpen(pl)),
          ),
        const SizedBox(height: Space.s300),
        PressButton(
          label: '選手を作る',
          icon: Icons.person_add_alt_1,
          onPressed: store.canCreatePlayer ? widget.onCreate : null,
        ),
        if (!store.canCreatePlayer)
          Padding(
            padding: const EdgeInsets.only(top: Space.s200),
            child: Text(
              '現役の選手は ${AppStore.maxActivePlayers} 人までです。誰かが引退すると作れます。',
              style: Txt.caption.copyWith(color: p.onSurfaceVariant),
            ),
          ),
      ],
    );
  }
}

class PlayerRow extends StatelessWidget {
  const PlayerRow({super.key, required this.player, required this.onTap, this.current = false});

  final Player player;
  final VoidCallback onTap;
  final bool current;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final c = player.career;
    final s = player.current;
    final status = player.isActive ? '${s.year} 年 ${s.playedCount} / ${s.totalGames} 試合' : '${s.year} 年に引退';
    return PressCard(
      onTap: onTap,
      label: '${player.name}、${player.isActive ? '現役' : '引退'}、${current ? '遊んでいる選手、' : ''}通算打率 ${rate(c.average)}',
      child: Padding(
        padding: const EdgeInsets.all(Space.s300),
        child: Row(
          children: [
            JerseyBadge(s.uniformNumber, size: 44),
            const SizedBox(width: Space.s300),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: Space.s200,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(player.name, style: Txt.control),
                      if (current) _Tag('遊んでいる', color: p.secondaryContainer, fg: p.onSecondaryContainer),
                      if (!player.isActive) _Tag('引退', color: p.surfaceVariant, fg: p.onSurface),
                    ],
                  ),
                  Text(
                    '${s.team.abbreviation}・${player.mainPosition.short}・$status',
                    style: Txt.caption.copyWith(color: p.onSurfaceVariant),
                  ),
                  Text(
                    '通算 ${rate(c.average)}  ${grouped(c.hits)} 安打  ${c.homeRuns} 本',
                    style: Txt.caption.merge(Txt.tabular),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: p.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag(this.text, {required this.color, required this.fg});

  final String text;
  final Color color;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Space.s150, vertical: Space.s50),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(Radii.control)),
      child: Text(text, style: Txt.caption.copyWith(color: fg)),
    );
  }
}

/// 1 つの季の試合の一覧（season_game_history.md）。新しい試合を上から並べる。
/// 今季のほか、終えた季や引退した選手の季も開ける（D-17、D-19）。
/// 行を押すと直せる。出場した試合は入力画面で開き直し（openEditor）、欠場の試合はチームの勝敗をシートで直す。
class GameHistoryScreen extends StatefulWidget {
  const GameHistoryScreen({super.key, required this.player, this.season, this.openEditor});

  final Player player;

  /// 開く季。無ければ今季。
  final Season? season;

  /// 開き直した試合の入力画面を開く。案ごとに入力画面が違うので、開く処理を受け取る。無ければ行を押せない。
  final VoidCallback? openEditor;

  @override
  State<GameHistoryScreen> createState() => _GameHistoryScreenState();
}

/// 絞り込み（D-19、U-9）。
enum _GameFilter {
  all('すべて'),
  homeRun('本塁打'),
  multiHit('複数安打'),
  memo('メモあり'),
  skipped('欠場');

  const _GameFilter(this.label);
  final String label;

  bool test(GameRecord g) => switch (this) {
    all => true,
    homeRun => g.atBats.any((a) => a.result == AtBatResult.homeRun),
    multiHit => g.atBats.where((a) => a.result.isHit).length >= 2,
    memo => g.memo != null,
    skipped => !g.played,
  };
}

class _GameHistoryScreenState extends State<GameHistoryScreen> {
  _GameFilter _filter = _GameFilter.all;

  /// 直せなかった理由。スナックバーは使わず、一覧の上に出す（Q-12）。
  String? _notice;

  Season get _season => widget.season ?? widget.player.current;

  void _open(BuildContext context, AppStore store, GameRecord g) {
    final index = g.number - 1;
    if (!g.played) {
      showSkippedGameSheet(context, store, index, season: _season);
      return;
    }
    if (!store.editGame(index, season: _season)) {
      final next = widget.player.current.playedCount + 1;
      setState(() => _notice = '入力中の第 $next 戦を保存するか消すと、前の試合を直せます。');
      return;
    }
    setState(() => _notice = null);
    widget.openEditor!();
  }

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final s = _season;
    final finished = s != widget.player.current || s.isComplete || !widget.player.isActive;
    final shown = [for (final g in s.games.reversed) if (_filter.test(g)) g];
    return Scaffold(
      appBar: AppBar(title: Text('${year(s.year)}の試合')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
        children: [
          Row(
            children: [
              Expanded(child: Text(year(s.year), style: Txt.heading)),
              if (finished && s.games.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(right: Space.s300),
                  child: Text('最終 ${s.teamRank} 位', style: Txt.control.merge(Txt.tabular)),
                ),
              Text('${s.playedCount} / ${s.totalGames} 試合', style: Txt.control.merge(Txt.tabular)),
            ],
          ),
          if (widget.openEditor != null)
            Text(
              finished ? '試合を押すと直せます。直したら、この年のタイトルと順位も見直してください。' : '試合を押すと、直したり消したりできます。',
              style: Txt.caption.copyWith(color: p.onSurfaceVariant),
            ),
          if (_notice != null)
            Container(
              margin: const EdgeInsets.only(top: Space.s200),
              padding: const EdgeInsets.all(Space.s300),
              decoration: BoxDecoration(
                color: p.surfaceContainer,
                borderRadius: BorderRadius.circular(Radii.control),
                border: Border.all(color: p.ink, width: Borders.thick),
              ),
              child: Semantics(liveRegion: true, child: Text(_notice!, style: Txt.body)),
            ),
          const SizedBox(height: Space.s300),
          if (s.games.isNotEmpty)
            ChoiceWrap<_GameFilter>(
              semanticsLabel: '絞り込み',
              values: _GameFilter.values,
              label: (f) => f.label,
              isSelected: (f) => f == _filter,
              onSelected: (f) => setState(() => _filter = f),
            ),
          const SizedBox(height: Space.s300),
          if (s.games.isEmpty)
            const Text('まだ試合がありません。')
          else if (shown.isEmpty)
            const Text('当てはまる試合がありません。'),
          // 季の途中で移籍したら、所属期間ごとに「第 N 戦から {球団名}」の区切りを置く（D-23）。
          // 新しい試合を上に並べるので、区切りは所属期間の塊の上に置く。
          if (_filter == _GameFilter.all && s.hasTransfer && s.stintGames.isEmpty)
            _StintDivider(from: s.playedCount + 1, team: s.team.name, empty: true),
          for (final (i, g) in shown.indexed) ...[
            if (s.hasTransfer && (i == 0 || shown[i - 1].stint != g.stint))
              _StintDivider(
                from: s.games.firstWhere((x) => x.stint == g.stint).number,
                team: s.stintOf(g.stint).team.name,
              ),
            StaggerIn(
              key: ValueKey(g.number),
              index: i,
              child: GameLine(
                game: g,
                rankFrom: s.rankBefore(g.number - 1),
                onTap: widget.openEditor == null ? null : () => _open(context, store, g),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StintDivider extends StatelessWidget {
  const _StintDivider({required this.from, required this.team, this.empty = false});

  final int from;
  final String team;
  final bool empty;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: Space.s300, bottom: Space.s150),
      child: Semantics(
        header: true,
        child: Row(
          children: [
            Text('第 $from 戦から $team', style: Txt.control.copyWith(fontWeight: FontWeight.w700)),
            if (empty) Text('  まだ試合がありません', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            const SizedBox(width: Space.s200),
            Expanded(child: Divider(color: p.ink, thickness: Borders.thick)),
          ],
        ),
      ),
    );
  }
}

/// 1 試合の成績の 1 行（「3 打数 2 安打 1 打点」）。欠場なら「欠場」。
String gameSummary(GameRecord game) {
  if (!game.played) return '欠場';
  final line = BattingLine.of([game]);
  return [
    if (line.plateAppearances > 0) '${line.atBats} 打数 ${line.hits} 安打',
    if (line.homeRuns > 0) '${line.homeRuns} 本',
    if (line.rbi > 0) '${line.rbi} 打点',
    if (line.steals > 0) '${line.steals} 盗塁',
    if (line.plateAppearances == 0) '走塁のみ',
  ].join(' ');
}

/// 1 試合の 1 行。スコアブックの記号で打席を並べる。
class GameLine extends StatelessWidget {
  const GameLine({super.key, required this.game, this.rankFrom, this.dense = false, this.onTap});

  final GameRecord game;
  final int? rankFrom;
  final bool dense;

  /// 押して直す。無ければ押せない行にする。
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final o = game.outcome;
    final summary = gameSummary(game);
    final rankChanged = rankFrom != null && game.teamRank != null && game.teamRank != rankFrom;
    final rankLabel = rankChanged ? '、チーム順位 $rankFrom 位から ${game.teamRank} 位' : '';
    final score = game.myScore == null ? '' : '${game.myScore} 対 ${game.opponentScore}、';
    final row = Semantics(
      label: '第 ${game.number} 戦、${o == null ? '' : '${o.label}、$score'}$summary$rankLabel${game.memo == null ? '' : '、メモ ${game.memo}'}',
      button: onTap != null,
      hint: onTap == null ? null : '直す',
      excludeSemantics: true,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: dense ? Space.s150 : Space.s200),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: p.surfaceVariant)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 56,
              child: Text('${game.number}', style: Txt.control.merge(Txt.tabular).copyWith(color: p.onSurfaceVariant)),
            ),
            // 勝敗は升と同じ見本で示す。升の一覧と行を同じ形で結ぶ。
            SizedBox(
              width: 80,
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: Space.s150),
                    child: OutcomeSwatch(o),
                  ),
                  if (game.myScore != null) Text('${game.myScore}-${game.opponentScore}', style: Txt.control.merge(Txt.tabular)),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 順位の上下は 1 行目の右端に出す。動いた試合にだけ出し、成績の行の幅は削らない。
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: game.atBats.isNotEmpty
                            ? Text(game.atBats.map((a) => a.result.mark).join(' '), style: Txt.control)
                            : Text(summary, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                      ),
                      if (rankChanged)
                        Text(
                          '${game.teamRank! < rankFrom! ? '▲' : '▼'} ${game.teamRank} 位',
                          style: Txt.caption.merge(Txt.tabular),
                        ),
                    ],
                  ),
                  if (game.atBats.isNotEmpty) Text(summary, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                  if (game.memo != null)
                    Text(
                      game.memo!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Txt.caption.copyWith(color: p.onSurface),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
    return onTap == null ? row : InkWell(onTap: onTap, child: row);
  }
}

/// 欠場の試合を直すシート。チームの勝敗を選び直し、試合を消せる。選ぶとすぐ記録に入る。
Future<void> showSkippedGameSheet(BuildContext context, AppStore store, int index, {Season? season}) {
  return showModalBottomSheet<void>(
    context: context,
    sheetAnimationStyle: sheetAnimation(context),
    isScrollControlled: true,
    builder: (_) => StoreScope(store: store, child: _SkippedGameSheet(index: index, season: season)),
  );
}

class _SkippedGameSheet extends StatelessWidget {
  const _SkippedGameSheet({required this.index, this.season});

  final int index;
  final Season? season;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final games = (season ?? store.current!.current).games;
    if (index >= games.length) return const SizedBox.shrink();
    final g = games[index];
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(header: true, child: Text('第 ${g.number} 戦（欠場）', style: Txt.heading)),
            const SizedBox(height: Space.s300),
            Text('チームの勝敗', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            const SizedBox(height: Space.s100),
            ChoiceWrap<GameOutcome?>(
              semanticsLabel: 'チームの勝敗',
              values: const [null, GameOutcome.win, GameOutcome.loss, GameOutcome.draw],
              label: (o) => o?.label ?? '未記録',
              isSelected: (o) => o == g.teamOutcome,
              onSelected: (o) => store.setSkippedOutcome(index, o, season: season),
            ),
            const SizedBox(height: Space.s600),
            Row(
              children: [
                Expanded(
                  child: PressButton(
                    label: 'この試合を消す',
                    kind: PressKind.destructive,
                    onPressed: () async {
                      final navigator = Navigator.of(context);
                      final ok = await confirmDialog(
                        context,
                        title: '第 ${g.number} 戦を消しますか？',
                        message: '後ろの試合の番号が 1 つずつ詰まります。',
                        confirm: '消す',
                        destructive: true,
                      );
                      if (!ok) return;
                      store.deleteGame(index, season: season);
                      navigator.pop();
                    },
                  ),
                ),
                const SizedBox(width: Space.s300),
                Expanded(
                  child: PressButton(label: '閉じる', kind: PressKind.primary, onPressed: () => Navigator.pop(context)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
