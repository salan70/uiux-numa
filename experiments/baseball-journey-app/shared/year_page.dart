import 'package:flutter/material.dart';

import 'directory.dart';
import 'format.dart';
import 'model.dart';
import 'nav.dart';
import 'theme.dart';
import 'widgets.dart';

// その年の 1 ページ（D-19、U-8、season_end_wizard.md）。1 年を 1 枚にまとめる。
// シーズンの終わりの今季の段の最初に置き、選手の詳細の年度別から見返す。
// 自己最高は、数える項目はそれまでのどの季より多いとき、率は規定打席に達した季どうしで比べて高いときに付ける（R-3-a、D-34）。

class YearPage extends StatelessWidget {
  const YearPage({super.key, required this.player, required this.season, this.showTitles = true});

  final Player player;
  final Season season;

  /// タイトルを出す。シーズンの終わりではまだ選んでいないので出さない。
  final bool showTitles;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final index = player.seasons.indexOf(season);
    final earlier = player.seasons.take(index).toList();
    final before = earlier.lastOrNull?.line;
    final line = season.line;
    final careerBefore = BattingLine.of([for (final s in earlier) ...s.games]);
    final careerAfter = BattingLine.of([for (final s in earlier) ...s.games, ...season.games]);
    final milestones = milestonesBetween(careerBefore, careerAfter);
    final memos = [for (final g in season.games.reversed) if (g.memo != null) g].take(5).toList();

    bool best(int Function(BattingLine) f) =>
        earlier.isNotEmpty && f(line) > 0 && earlier.every((s) => f(line) > f(s.line));
    // 率は打席の少ない季に大きく振れるので、規定打席に達した季どうしだけで比べる。比べる季が無ければ付けない。
    final qualifiedEarlier = [for (final s in earlier) if (s.qualified) s.line];
    bool bestRate(double? Function(BattingLine) f) {
      final now = f(line);
      return season.qualified &&
          now != null &&
          qualifiedEarlier.isNotEmpty &&
          qualifiedEarlier.every((l) => f(l) == null || now > f(l)!);
    }
    String? intDelta(int now, int? was) => was == null || now == was ? null : now > was ? '+${now - was}' : '−${was - now}';
    String? rateDelta(double? now, double? was) {
      if (now == null || was == null) return null;
      final d = now - was;
      return d.abs() < 0.0005 ? null : signedRate(d);
    }

    final tiles = [
      (StatTile(label: '打率', value: rate(line.average), delta: rateDelta(line.average, before?.average), large: false), bestRate((l) => l.average)),
      (StatTile(label: '本塁打', value: '${line.homeRuns}', delta: intDelta(line.homeRuns, before?.homeRuns), large: false), best((l) => l.homeRuns)),
      (StatTile(label: '打点', value: '${line.rbi}', delta: intDelta(line.rbi, before?.rbi), large: false), best((l) => l.rbi)),
      (StatTile(label: '安打', value: '${line.hits}', delta: intDelta(line.hits, before?.hits), large: false), best((l) => l.hits)),
      (StatTile(label: '盗塁', value: '${line.steals}', delta: intDelta(line.steals, before?.steals), large: false), best((l) => l.steals)),
      (StatTile(label: 'OPS', value: rate(line.ops), delta: rateDelta(line.ops, before?.ops), large: false), bestRate((l) => l.ops)),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _Masthead(player: player, season: season),
        SectionTitle(
          '成績',
          trailing: Text(
            before == null ? 'プロ 1 年目' : '差は ${season.year - 1} 年から',
            style: Txt.caption.copyWith(color: p.onSurfaceVariant),
          ),
        ),
        LayoutBuilder(
          builder: (context, c) {
            final width = (c.maxWidth - Space.s400 * 2) / 3;
            return Wrap(
              spacing: Space.s400,
              runSpacing: Space.s400,
              children: [
                for (final (tile, isBest) in tiles)
                  SizedBox(
                    width: width,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        tile,
                        if (isBest)
                          Semantics(
                            label: '自己最高',
                            child: Padding(
                              padding: const EdgeInsets.only(top: Space.s100),
                              child: Text(
                                '★ 自己最高',
                                style: Txt.caption.copyWith(color: p.primary, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
              ],
            );
          },
        ),
        Padding(
          padding: const EdgeInsets.only(top: Space.s200),
          child: Text(
            '${line.games} 試合 ${line.plateAppearances} 打席 ${line.atBats} 打数・${line.walks} 四球 ${line.strikeouts} 三振・'
            '規定打席 ${season.qualifyingPlateAppearances} に${season.qualified ? '到達' : '未到達'}',
            style: Txt.caption.merge(Txt.tabular).copyWith(color: p.onSurfaceVariant),
          ),
        ),
        if (milestones.isNotEmpty) ...[
          const SectionTitle('達した節目'),
          for (final m in milestones) Padding(padding: const EdgeInsets.only(bottom: Space.s200), child: MilestoneBanner(text: m)),
        ],
        const SectionTitle('チーム'),
        for (final st in season.stints) _StintRecord(season: season, stint: st),
        if (showTitles && season.titles.isNotEmpty) ...[
          const SectionTitle('タイトル'),
          Wrap(
            spacing: Space.s200,
            runSpacing: Space.s200,
            children: [for (final t in season.titles) _Badge(t)],
          ),
        ],
        SectionTitle('メモを付けた試合', trailing: memos.isEmpty ? null : Text('新しい順', style: Txt.caption.copyWith(color: p.onSurfaceVariant))),
        if (memos.isEmpty)
          Text('この年はメモを付けた試合がありません。', style: Txt.body.copyWith(color: p.onSurfaceVariant))
        else
          for (final g in memos) _MemoLine(game: g),
      ],
    );
  }
}

/// 見出し。年、球団（季の途中の移籍は矢印でつなぐ）、年齢、背番号。
class _Masthead extends StatelessWidget {
  const _Masthead({required this.player, required this.season});

  final Player player;
  final Season season;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final teams = season.stints.map((s) => s.team.name).join(' → ');
    return Semantics(
      header: true,
      label: '${season.year} 年、$teams、${season.year - player.birthYear} 歳、プロ ${player.seasons.indexOf(season) + 1} 年目',
      excludeSemantics: true,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text('${season.year}', style: Txt.figure.copyWith(color: p.onSurface)),
          const SizedBox(width: Space.s300),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(teams, style: Txt.control.copyWith(fontWeight: FontWeight.w700)),
                Text(
                  '${season.year - player.birthYear} 歳・プロ ${player.seasons.indexOf(season) + 1} 年目・#${season.uniformNumber}',
                  style: Txt.caption.copyWith(color: p.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 所属期間ごとのチームの勝敗と最終順位。最終順位は所属期間の最後の試合の順位（R-7-1、R-7-3）。
class _StintRecord extends StatelessWidget {
  const _StintRecord({required this.season, required this.stint});

  final Season season;
  final Stint stint;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final games = [for (final g in season.games) if (g.stint == stint.id) g];
    int count(GameOutcome o) => games.where((g) => g.outcome == o).length;
    final unrecorded = games.where((g) => g.outcome == null).length;
    final rank = games.lastOrNull?.teamRank ?? stint.startRank;
    final label = season.hasTransfer ? '${stint.team.name}（${games.length} 試合）' : stint.team.name;
    return Padding(
      padding: const EdgeInsets.only(bottom: Space.s200),
      child: Semantics(
        label:
            '$label、${count(GameOutcome.win)} 勝 ${count(GameOutcome.loss)} 敗 ${count(GameOutcome.draw)} 分'
            '${unrecorded > 0 ? '、未記録 $unrecorded 試合' : ''}、${season.isComplete ? '最終' : '今'} $rank 位',
        excludeSemantics: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (season.hasTransfer) Text(label, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            Row(
              children: [
                Text(
                  '${count(GameOutcome.win)} 勝 ${count(GameOutcome.loss)} 敗 ${count(GameOutcome.draw)} 分',
                  style: Txt.control.merge(Txt.tabular).copyWith(fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(text: season.isComplete ? '最終 ' : '今 ', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                      TextSpan(text: '$rank 位', style: Txt.control.merge(Txt.tabular).copyWith(fontWeight: FontWeight.w700)),
                      TextSpan(text: ' / ${stint.team.teamCount} 球団', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                    ],
                  ),
                ),
              ],
            ),
            // 勝敗を入れずに欠場で進めた試合は、勝敗の合計が試合数と合わない理由として数を添える。
            if (unrecorded > 0)
              Text('勝敗の未記録 $unrecorded 試合', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}

class _MemoLine extends StatelessWidget {
  const _MemoLine({required this.game});

  final GameRecord game;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final o = game.outcome;
    return Container(
      margin: const EdgeInsets.only(bottom: Space.s200),
      padding: const EdgeInsets.all(Space.s300),
      decoration: BoxDecoration(
        color: p.surfaceContainer,
        borderRadius: BorderRadius.circular(Radii.control),
        border: Border.all(color: p.ink, width: Borders.thick),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '第 ${game.number} 戦${o == null ? '' : '・${o.label} ${game.myScore}-${game.opponentScore}'}・${gameSummary(game)}',
            style: Txt.caption.merge(Txt.tabular).copyWith(color: p.onSurfaceVariant),
          ),
          const SizedBox(height: Space.s100),
          Text(game.memo!, style: Txt.body.copyWith(color: p.onSurface)),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s150),
      decoration: BoxDecoration(
        color: p.tertiaryContainer,
        borderRadius: BorderRadius.circular(Radii.control),
        border: Border.all(color: p.ink, width: Borders.thick),
      ),
      child: Text(text, style: Txt.control.copyWith(color: p.onTertiaryContainer, fontWeight: FontWeight.w700)),
    );
  }
}

/// 選手の詳細の年度別から開く、その年の 1 ページ。
class YearPageScreen extends StatelessWidget {
  const YearPageScreen({super.key, required this.player, required this.season});

  final Player player;
  final Season season;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${year(season.year)}の 1 ページ')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
        children: [
          YearPage(player: player, season: season),
          const SizedBox(height: Space.s400),
          PressButton(
            label: '${year(season.year)}の試合を見る',
            icon: Icons.list_alt,
            onPressed: () => openHistory(
              context,
              player,
              season: season,
              openEditor: openGameEditor == null ? null : () => openGameEditor!(context),
            ),
          ),
        ],
      ),
    );
  }
}
