import 'package:flutter/material.dart';

import 'format.dart';
import 'model.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 選手の詳細（screen_design/player_detail.md）。3 つのタブ（概要、年度別、能力）と共有を持つ。
// 製品の「プロフィール」タブは、経歴と通算の数を合わせて「概要」にした。判断に要る通算の数を先に置くため。

class PlayerDetailScreen extends StatelessWidget {
  const PlayerDetailScreen({super.key, required this.player, this.onPlay});

  final Player player;

  /// 現役の選手を名鑑から開いたときの「この選手で続ける」。
  final VoidCallback? onPlay;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('選手'),
        actions: [ShareAction(player: player)],
      ),
      body: PlayerDetailBody(player: player),
      bottomNavigationBar: onPlay == null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s300),
                child: PressButton(label: 'この選手で続ける', kind: PressKind.primary, onPressed: onPlay),
              ),
            ),
    );
  }
}

class ShareAction extends StatelessWidget {
  const ShareAction({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: '共有',
      icon: const Icon(Icons.ios_share),
      onPressed: () => showModalBottomSheet<void>(
        context: context,
        sheetAnimationStyle: sheetAnimation(context),
        isScrollControlled: true,
        builder: (_) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Semantics(header: true, child: const Text('選手カードを共有', style: Txt.heading)),
                const SizedBox(height: Space.s300),
                PlayerCard(player: player),
                const SizedBox(height: Space.s300),
                Text('このモックでは画像を書き出しません。', style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 共有と名鑑の見本に使う 1 枚。野球カードの表面に当たる。
class PlayerCard extends StatelessWidget {
  const PlayerCard({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final c = player.career;
    final first = player.seasons.first.year;
    final last = player.current.year;
    return Panel(
      color: p.primaryContainer,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PlayerHeader(player: player),
          const SizedBox(height: Space.s300),
          Text('$first〜$last 年・${player.proYears} 年', style: Txt.caption.copyWith(color: p.onSurface)),
          const SizedBox(height: Space.s200),
          Wrap(
            spacing: Space.s500,
            runSpacing: Space.s200,
            children: [
              StatTile(label: '通算打率', value: rate(c.average), large: false),
              StatTile(label: '通算安打', value: grouped(c.hits), large: false),
              StatTile(label: '通算本塁打', value: '${c.homeRuns}', large: false),
              StatTile(label: 'タイトル', value: '${player.allTitles.length}', large: false),
            ],
          ),
        ],
      ),
    );
  }
}

class PlayerDetailBody extends StatelessWidget {
  const PlayerDetailBody({super.key, required this.player, this.showHeader = true});

  final Player player;
  final bool showHeader;

  @override
  Widget build(BuildContext context) {
    StoreScope.of(context);
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          if (showHeader)
            Padding(
              padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s300),
              child: PlayerHeader(player: player),
            ),
          const TabBar(
            tabs: [
              Tab(text: '概要'),
              Tab(text: '年度別'),
              Tab(text: '能力'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _Overview(player: player),
                YearlyTable(player: player),
                AbilityView(player: player),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Overview extends StatelessWidget {
  const _Overview({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final career = player.career;
    final o = player.origin;
    return ListView(
      padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s1000),
      children: [
        SectionTitle('通算', trailing: Text('${player.proYears} 年', style: Txt.caption)),
        SeasonStatGrid(line: career),
        const SectionTitle('タイトル'),
        if (player.allTitles.isEmpty)
          Text('まだタイトルはありません。シーズンを終えるときに選べます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant))
        else
          for (final s in player.seasons.where((s) => s.titles.isNotEmpty)) FactRow(year(s.year), s.titles.join('、')),
        const SectionTitle('球団'),
        for (final stint in teamStints(player)) FactRow(stint.$1, stint.$2),
        const SectionTitle('入団'),
        FactRow('経路', o.draftRound == null ? o.route.label : '${o.route.label} ${o.draftRound} 位'),
        FactRow('入団年', year(o.joiningYear)),
        FactRow('経歴', player.background.label),
        if (o.memo != null) FactRow('メモ', o.memo!),
        const SectionTitle('からだ'),
        FactRow('身長', '${player.height} cm'),
        FactRow('体重', '${player.weight} kg'),
        FactRow('投打', player.handedness),
        FactRow('守備', player.positions.map((e) => e.label).join('、')),
      ],
    );
  }
}

/// 球団の変遷。連続する同じ球団をまとめ、「2013〜2020 年」と球団名の組にする。
List<(String, String)> teamStints(Player player) {
  final out = <(String, String)>[];
  var start = player.seasons.first;
  for (var i = 1; i <= player.seasons.length; i++) {
    final end = i == player.seasons.length || player.seasons[i].team.name != start.team.name;
    if (!end) continue;
    final last = player.seasons[i - 1];
    final span = start.year == last.year ? '${start.year} 年' : '${start.year}〜${last.year} 年';
    out.add((span, start.team.name));
    if (i < player.seasons.length) start = player.seasons[i];
  }
  return out;
}

/// 年度別の成績。年の列を固定し、項目を横に送る（player_detail.md の横スクロールの表）。
class YearlyTable extends StatelessWidget {
  const YearlyTable({super.key, required this.player});

  final Player player;

  static const _columns = ['球団', '試合', '打率', '本塁打', '打点', '安打', '盗塁', '四球', '三振', 'OPS'];

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    List<String> cells(String team, BattingLine l) => [
      team,
      '${l.games}',
      rate(l.average),
      '${l.homeRuns}',
      '${l.rbi}',
      grouped(l.hits),
      '${l.steals}',
      '${l.walks}',
      '${l.strikeouts}',
      rate(l.ops),
    ];
    final rows = [
      for (final s in player.seasons.reversed) (year(s.year), cells(s.team.abbreviation, s.line), false),
      ('通算', cells('', player.career), true),
    ];
    final textStyle = Txt.ui.merge(Txt.tabular);
    Widget cell(String text, {bool bold = false, double width = 64, TextAlign align = TextAlign.right}) => Container(
      width: width,
      padding: const EdgeInsets.symmetric(horizontal: Space.s150, vertical: Space.s200),
      child: Text(
        text,
        textAlign: align,
        style: bold ? textStyle.copyWith(fontWeight: FontWeight.w700) : textStyle,
      ),
    );
    final scale = MediaQuery.textScalerOf(context).scale(1);
    final firstWidth = 92.0 * scale;
    final colWidth = 64.0 * scale;
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: Space.s1000),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              cell('年', width: firstWidth, align: TextAlign.left),
              for (final r in rows)
                DecoratedBox(
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: r.$3 ? p.ink : p.surfaceVariant, width: r.$3 ? 2 : 1),
                    ),
                  ),
                  child: cell(r.$1, width: firstWidth, bold: r.$3, align: TextAlign.left),
                ),
            ],
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [for (final c in _columns) cell(c, width: colWidth)]),
                  for (final r in rows)
                    DecoratedBox(
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: r.$3 ? p.ink : p.surfaceVariant, width: r.$3 ? 2 : 1),
                        ),
                      ),
                      child: Row(
                        children: [for (final v in r.$2) cell(v, width: colWidth, bold: r.$3)],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 能力。年を選び、前の年との差を添える。
class AbilityView extends StatefulWidget {
  const AbilityView({super.key, required this.player});

  final Player player;

  @override
  State<AbilityView> createState() => _AbilityViewState();
}

class _AbilityViewState extends State<AbilityView> {
  late int _index = widget.player.seasons.length - 1;

  @override
  Widget build(BuildContext context) {
    final seasons = widget.player.seasons;
    final index = _index.clamp(0, seasons.length - 1);
    final season = seasons[index];
    final previous = index > 0 ? seasons[index - 1] : null;
    return ListView(
      padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s1000),
      children: [
        SizedBox(
          height: Sizes.target + Space.s200,
          child: ListView(
            scrollDirection: Axis.horizontal,
            reverse: true,
            children: [
              for (var i = seasons.length - 1; i >= 0; i--)
                Padding(
                  padding: const EdgeInsets.only(left: Space.s200),
                  child: ChoiceWrap<int>(
                    values: [i],
                    label: (i) => '${seasons[i].year}',
                    isSelected: (i) => i == index,
                    onSelected: (i) => setState(() => _index = i),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: Space.s300),
        for (final a in season.abilities)
          AbilityBar(ability: a, previous: previous?.abilities.where((b) => b.name == a.name).firstOrNull?.value),
      ],
    );
  }
}

class AbilityBar extends StatelessWidget {
  const AbilityBar({super.key, required this.ability, this.previous});

  final Ability ability;
  final int? previous;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final delta = previous == null ? 0 : ability.value - previous!;
    return Semantics(
      label:
          '${ability.name} ${ability.rank} ${ability.value}${delta == 0 ? '' : '、前の年から ${delta > 0 ? '+' : '−'}${delta.abs()}'}',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.s150),
        child: Row(
          children: [
            SizedBox(width: 84, child: Text(ability.name, style: Txt.ui)),
            Container(
              width: 40,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(vertical: Space.s50),
              decoration: BoxDecoration(
                color: _rankColor(p, ability.value),
                borderRadius: BorderRadius.circular(Radii.control),
                border: Border.all(color: p.ink, width: Borders.thick),
              ),
              child: Text(
                ability.rank,
                style: Txt.control.copyWith(color: ability.value >= 60 ? p.onPrimary : p.onSurface),
              ),
            ),
            const SizedBox(width: Space.s200),
            SizedBox(
              width: 32,
              child: Text('${ability.value}', textAlign: TextAlign.right, style: Txt.control.merge(Txt.tabular)),
            ),
            const SizedBox(width: Space.s200),
            Expanded(
              child: Container(
                height: 10,
                decoration: BoxDecoration(color: p.surfaceContainer, borderRadius: BorderRadius.circular(Radii.pill)),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: ability.value / 99,
                  child: Container(
                    decoration: BoxDecoration(color: p.secondary, borderRadius: BorderRadius.circular(Radii.pill)),
                  ),
                ),
              ),
            ),
            SizedBox(
              width: 40,
              child: Text(
                delta == 0 ? '' : '${delta > 0 ? '+' : '−'}${delta.abs()}',
                textAlign: TextAlign.right,
                style: Txt.caption.merge(Txt.tabular).copyWith(color: delta > 0 ? p.primaryText : p.onSurfaceVariant),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// ランクの札。C 以上は黄（primary）、A 以上は赤橙（tertiary）の面に on-primary の字、D 以下は面の変化に本文の字を置く。
  /// 色は段の目安で、ランクの字が意味を担う。
  static Color _rankColor(Palette p, int v) => v >= 80
      ? p.tertiary
      : v >= 60
      ? p.primary
      : p.surfaceVariant;
}
