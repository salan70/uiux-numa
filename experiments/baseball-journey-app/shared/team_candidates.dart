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
          ChoiceWrap<TeamOption>(
            semanticsLabel: 'これまでの球団',
            values: teams,
            label: (t) => t.team.name,
            isSelected: (t) => t.team.name == selectedTeam,
            onSelected: onTeam,
          ),
          const SizedBox(height: Space.s200),
        ],
        if (leagues.isNotEmpty) ...[
          Text('これまでのリーグ（球団名は自分で入れる）', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s100),
          ChoiceWrap<LeagueOption>(
            semanticsLabel: 'これまでのリーグ',
            values: leagues,
            label: (l) => l.league,
            isSelected: (l) => l.league == selectedLeague,
            onSelected: onLeague,
          ),
          const SizedBox(height: Space.s200),
        ],
      ],
    );
  }
}
