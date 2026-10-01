import 'package:flutter/material.dart';

import 'face_editor.dart';
import 'format.dart';
import 'model.dart';
import 'parts.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';
import 'year_page.dart';

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
        actions: [
          ShareAction(player: player),
          PopupMenuButton<String>(
            tooltip: 'メニュー',
            onSelected: (v) => v == 'face' ? showFaceSheet(context, player) : _delete(context),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'face', child: Text('顔を直す')),
              const PopupMenuItem(value: 'delete', child: Text('この選手を消す')),
            ],
          ),
        ],
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

  /// 選手を消す（D-22）。確認の後に、その選手の季、試合、球団、下書きを消し、名鑑へ戻る。足したタイトルは残す。
  Future<void> _delete(BuildContext context) async {
    final store = StoreScope.read(context);
    final navigator = Navigator.of(context);
    final ok = await confirmDialog(
      context,
      title: '${player.name}を消しますか？',
      message: '${player.proYears} 年分の季と試合の記録が消えます。消した選手は戻せません。足したタイトルは残ります。',
      confirm: '消す',
      destructive: true,
    );
    if (!ok) return;
    final wasCurrent = store.currentId == player.id;
    store.deletePlayer(player);
    // 遊んでいた選手なら選手トップも開けないので、タイトルまで戻る。ほかの選手なら名鑑へ戻る。
    wasCurrent ? navigator.popUntil((r) => r.isFirst) : navigator.pop();
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
                // この 1 枚を画像にして、端末の共有で送る（D-19、G-17）。
                ShareCard(player: player),
                const SizedBox(height: Space.s300),
                _ShareButton(),
              ],
            ),
          ),
        ),
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
        Panel(child: SeasonStatGrid(line: career)),
        const SectionTitle('タイトル'),
        if (player.allTitles.isEmpty)
          Text('まだタイトルはありません。シーズンを終えるときに選べます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant))
        else
          for (final s in player.seasons.where((s) => s.titles.isNotEmpty)) _TitleYear(year: year(s.year), titles: s.titles),
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

/// 1 年のタイトル。タイトルは稀な達成なので、黄の札にして事実の行より強く見せる。
class _TitleYear extends StatelessWidget {
  const _TitleYear({required this.year, required this.titles});

  final String year;
  final List<String> titles;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      label: '$year、${titles.join('、')}',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.s150),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 84,
              child: Padding(
                padding: const EdgeInsets.only(top: Space.s50),
                child: Text(year, style: Txt.ui.merge(Txt.tabular).copyWith(color: p.onSurfaceVariant)),
              ),
            ),
            Expanded(
              child: Wrap(
                spacing: Space.s150,
                runSpacing: Space.s150,
                children: [
                  for (final t in titles)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: Space.s200, vertical: Space.s50),
                      decoration: BoxDecoration(
                        color: p.primary,
                        borderRadius: BorderRadius.circular(Radii.control),
                        border: Border.all(color: p.ink, width: Borders.thick),
                        boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(2, 2))],
                      ),
                      child: Text(t, style: Txt.control.copyWith(color: p.onPrimary)),
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

/// 球団の変遷。連続する同じ球団をまとめ、「2013〜2020 年」と球団名の組にする。季の途中の移籍も区切りに数える（D-23）。
List<(String, String)> teamStints(Player player) {
  final spans = <(int, int, String)>[];
  for (final s in player.seasons) {
    for (final st in s.stints) {
      final last = spans.lastOrNull;
      if (last != null && last.$3 == st.team.name) {
        spans[spans.length - 1] = (last.$1, s.year, last.$3);
      } else {
        spans.add((s.year, s.year, st.team.name));
      }
    }
  }
  return [for (final (a, b, name) in spans) (a == b ? '$a 年' : '$a〜$b 年', name)];
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
      // 季の途中で移籍した年は、所属期間ごとの行の下に年の合計の行を置く（D-23）。
      for (final s in player.seasons.reversed)
        if (!s.hasTransfer)
          (year(s.year), cells(s.team.abbreviation, s.line), false, s)
        else ...[
          for (final st in s.stints)
            (year(s.year), cells(st.team.abbreviation, BattingLine.of(s.games.where((g) => g.stint == st.id))), false, s),
          ('${s.year} 計', cells('', s.line), true, s),
        ],
      ('通算', cells('', player.career), true, null),
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
              cell('年', width: firstWidth, align: TextAlign.left, bold: true),
              for (final r in rows)
                DecoratedBox(
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: r.$3 ? p.ink : p.surfaceVariant, width: r.$3 ? Bold.border : 1),
                    ),
                  ),
                  // 年を押すと、その年の 1 ページを開く（D-19）。
                  child: r.$4 == null
                      ? cell(r.$1, width: firstWidth, bold: r.$3, align: TextAlign.left)
                      : Semantics(
                          button: true,
                          hint: 'その年の 1 ページを開く',
                          child: InkWell(
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute<void>(builder: (_) => YearPageScreen(player: player, season: r.$4!)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                cell(r.$1, width: firstWidth - 20 * scale, bold: r.$3, align: TextAlign.left),
                                Icon(Icons.chevron_right, size: 20 * scale, color: p.onSurfaceVariant),
                              ],
                            ),
                          ),
                        ),
                ),
            ],
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [for (final c in _columns) cell(c, width: colWidth, bold: true)]),
                  for (final r in rows)
                    DecoratedBox(
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: r.$3 ? p.ink : p.surfaceVariant, width: r.$3 ? Bold.border : 1),
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
            SizedBox(width: 84, child: Text(ability.name, style: Txt.control)),
            Expanded(
              child: Container(
                height: 18,
                decoration: BoxDecoration(
                  color: p.surface,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: p.ink, width: Borders.thick),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: ability.value / 99,
                  child: Container(color: p.secondary),
                ),
              ),
            ),
            SizedBox(
              width: 40,
              child: Text('${ability.value}', textAlign: TextAlign.right, style: Txt.control.merge(Txt.tabular)),
            ),
            const SizedBox(width: Space.s150),
            Container(
              constraints: const BoxConstraints(minWidth: 30),
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: Space.s100),
              decoration: BoxDecoration(
                color: _rankColor(p, ability.value),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: p.ink, width: Borders.thick),
              ),
              child: Text(ability.rank, style: Txt.control.copyWith(color: inkOn(_rankColor(p, ability.value)))),
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

  /// ランクの札。C 以上は黄（primary）、A 以上は赤橙（tertiary）、D 以下は面の色にし、字は面の明るさで墨か紙を選ぶ。
  /// 色は段の目安で、ランクの字が意味を担う。
  static Color _rankColor(Palette p, int v) => v >= 80
      ? p.tertiary
      : v >= 60
      ? p.primary
      : p.surface;
}

/// 共有する画像。選手の札（ドット絵、名前、球団、背番号）、通算の成績、タイトルの数、小さなアプリ名。
class ShareCard extends StatelessWidget {
  const ShareCard({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final c = player.career;
    final titles = player.allTitles.length;
    return Semantics(
      label: '${player.name}の選手カード、通算 ${player.proYears} 年、${c.hits} 安打 ${c.homeRuns} 本塁打、タイトル $titles 個',
      excludeSemantics: true,
      child: BoldBox(
        padding: const EdgeInsets.all(Space.s300),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            PlayerHeader(player: player),
            const SizedBox(height: Space.s300),
            Row(
              children: [
                Text('通算 ${player.proYears} 年', style: Txt.control.copyWith(fontWeight: FontWeight.w700)),
                const Spacer(),
                Text('タイトル $titles 個', style: Txt.control.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: Space.s200),
            SeasonStatGrid(line: c, large: false),
            const SizedBox(height: Space.s300),
            Align(
              alignment: Alignment.centerRight,
              child: Text('Baseball Player Journey', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            ),
          ],
        ),
      ),
    );
  }
}

/// 端末の共有を開く。試作の Web では開けないので、押したら開いたつもりの文を出す。
class _ShareButton extends StatefulWidget {
  @override
  State<_ShareButton> createState() => _ShareButtonState();
}

class _ShareButtonState extends State<_ShareButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PressButton(
          label: '画像を共有する',
          icon: Icons.ios_share,
          kind: PressKind.primary,
          onPressed: () => setState(() => _pressed = true),
        ),
        const SizedBox(height: Space.s200),
        Text(
          _pressed ? '製品ではここで端末の共有が開きます（試作では開きません）。' : '上の 1 枚を画像にして送ります。',
          style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant),
        ),
      ],
    );
  }
}
