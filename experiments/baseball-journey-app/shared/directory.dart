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

/// 今季の試合の一覧（season_game_history.md）。選手トップと同じ 143 の升を上に置き、新しい試合を上から並べる。
class GameHistoryScreen extends StatelessWidget {
  const GameHistoryScreen({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final s = player.current;
    return Scaffold(
      appBar: AppBar(title: Text('${year(s.year)}の試合')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
        children: [
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(year(s.year), style: Txt.heading)),
                    Text('${s.playedCount} / ${s.totalGames} 試合', style: Txt.control.merge(Txt.tabular)),
                  ],
                ),
                const SizedBox(height: Space.s200),
                SeasonGrid(season: s),
                const SizedBox(height: Space.s200),
                SeasonGridLegend(season: s),
              ],
            ),
          ),
          const SizedBox(height: Space.s400),
          if (s.games.isEmpty) const Text('まだ試合がありません。'),
          for (final g in s.games.reversed) GameLine(game: g),
        ],
      ),
    );
  }
}

/// 1 試合の 1 行。スコアブックの記号で打席を並べる。
class GameLine extends StatelessWidget {
  const GameLine({super.key, required this.game, this.dense = false});

  final GameRecord game;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final o = game.outcome;
    final line = BattingLine.of([game]);
    final summary = !game.played
        ? '欠場'
        : [
            if (line.plateAppearances > 0) '${line.atBats} 打数 ${line.hits} 安打',
            if (line.homeRuns > 0) '${line.homeRuns} 本',
            if (line.rbi > 0) '${line.rbi} 打点',
            if (line.steals > 0) '${line.steals} 盗塁',
            if (line.plateAppearances == 0) '走塁のみ',
          ].join(' ');
    return Semantics(
      label: '第 ${game.number} 戦、${o == null ? '' : '${o.label}、${game.myScore} 対 ${game.opponentScore}、'}$summary',
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
                  if (o != null) Text('${game.myScore}-${game.opponentScore}', style: Txt.control.merge(Txt.tabular)),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (game.atBats.isNotEmpty) Text(game.atBats.map((a) => a.result.mark).join(' '), style: Txt.control),
                  Text(summary, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
