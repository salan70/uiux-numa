import 'package:flutter/material.dart';

import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 球団とリーグの候補（D-35）。どの選手かが一度でも使った球団とリーグを札で出す。
// 球団を選ぶと球団名、リーグ名、国名、球団数、年間試合数を、リーグを選ぶと球団名以外を写す。
// 写した後は選手ごとに持ち、ほかの選手の値は変えない。

class TeamCandidates extends StatelessWidget {
  const TeamCandidates({
    super.key,
    required this.selectedTeam,
    required this.selectedLeague,
    required this.onTeam,
    required this.onLeague,
    this.exclude,
  });

  final String selectedTeam;
  final String selectedLeague;
  final ValueChanged<TeamOption> onTeam;
  final ValueChanged<LeagueOption> onLeague;

  /// 候補から外す球団名（移籍の前の球団）。
  final String? exclude;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    final teams = [for (final t in store.teamOptions) if (t.team.name != exclude) t];
    final leagues = store.leagueOptions;
    if (teams.isEmpty && leagues.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (teams.isNotEmpty) ...[
          Text('これまでの球団', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          _RecentWrap<TeamOption>(
            title: 'これまでの球団',
            values: teams,
            label: (t) => t.team.name,
            detail: (t) => '${t.team.league}・${t.team.country}・${t.team.teamCount} 球団・${t.games} 試合',
            isSelected: (t) => t.team.name == selectedTeam,
            onSelected: onTeam,
          ),
          const SizedBox(height: Space.s200),
        ],
        if (leagues.isNotEmpty) ...[
          Text('これまでのリーグ（球団名は自分で入れる）', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          _RecentWrap<LeagueOption>(
            title: 'これまでのリーグ',
            values: leagues,
            label: (l) => l.league,
            detail: (l) => '${l.country}・${l.teamCount} 球団・${l.games} 試合',
            isSelected: (l) => l.league == selectedLeague,
            onSelected: onLeague,
          ),
          const SizedBox(height: Space.s200),
        ],
      ],
    );
  }
}

/// 直近の 2 件だけを札で出し、残りは「ほか N 件」からシートで選ぶ。選手が増えても候補の欄の高さを保つ。
/// シートで選んだ古い候補は、札の先頭に出して選んだことを示す。
class _RecentWrap<T> extends StatelessWidget {
  const _RecentWrap({
    required this.title,
    required this.values,
    required this.label,
    required this.detail,
    required this.isSelected,
    required this.onSelected,
  });

  static const _shown = 2;

  final String title;

  /// 新しく使った順。
  final List<T> values;
  final String Function(T) label;
  final String Function(T) detail;
  final bool Function(T) isSelected;
  final ValueChanged<T> onSelected;

  Future<void> _openAll(BuildContext context) async {
    final picked = await showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      sheetAnimationStyle: sheetAnimation(context),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (context, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s600),
          children: [
            Semantics(header: true, child: Text(title, style: Txt.heading)),
            Text('新しく使った順', style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant)),
            const SizedBox(height: Space.s200),
            for (final v in values)
              ListTile(
                contentPadding: EdgeInsets.zero,
                minTileHeight: Sizes.target + Space.s200,
                title: Text(label(v), style: Txt.control),
                subtitle: Text(detail(v)),
                trailing: isSelected(v) ? const Icon(Icons.check) : null,
                onTap: () => Navigator.pop(context, v),
              ),
          ],
        ),
      ),
    );
    if (picked != null) onSelected(picked);
  }

  @override
  Widget build(BuildContext context) {
    final picked = values.where(isSelected).firstOrNull;
    final shown = [
      if (picked != null && values.indexOf(picked) >= _shown) picked,
      ...values.take(_shown),
    ];
    final rest = values.length - _shown;
    return Wrap(
      spacing: Space.s200,
      runSpacing: Space.s200,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        ChoiceWrap<T>(semanticsLabel: title, values: shown, label: label, isSelected: isSelected, onSelected: onSelected),
        if (rest > 0)
          TextButton.icon(
            onPressed: () => _openAll(context),
            icon: const Icon(Icons.expand_more),
            label: Text('ほか $rest 件'),
          ),
      ],
    );
  }
}
