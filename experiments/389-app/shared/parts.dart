import 'package:flutter/material.dart';

import 'app.dart';
import 'data.dart';
import 'ds.dart';
import 'play.dart';
import 'profile.dart';

// 3 案のホームとマイ成績で同じ形の部品。

/// ホームの今日の1問のカード。製品の PlayStatsSummaryCard の上段（TODAY の札、週のドット、連続回答）を写し、未プレイなら挑戦の導線を足した。
class TodayCard extends StatelessWidget {
  const TodayCard({required this.onPlay, super.key, this.title = '今日の1問', this.note});

  final VoidCallback? onPlay;
  final String title;

  /// 連続回答の行の代わりに出す一言。
  final String? note;

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final done = p.dailyDone;
    return GestureDetector(
      onTap: done ? null : onPlay,
      child: DsCard(
        accentColor: DsColor.actionEmphasis,
        showDotGrid: true,
        hasShadow: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const DsBadge(label: 'TODAY', color: DsColor.actionPrimary, shape: DsBadgeShape.chamfered),
                const SizedBox(width: DsSpacing.space8),
                Text(
                  title,
                  style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                DsStatusDot(color: done ? DsColor.statusSuccess : DsColor.statusPending),
                const SizedBox(width: 6),
                Text(
                  done ? 'プレイ済み' : '未プレイ',
                  style: DsTypography.caption.copyWith(color: done ? DsColor.statusSuccess : DsColor.statusPending, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: DsSpacing.space12),
            WeekDots(days: p.weekDays, today: Profile.today),
            const SizedBox(height: DsSpacing.space12),
            Row(
              children: [
                Expanded(
                  child: note != null
                      ? Text(note!, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))
                      : Text.rich(
                          TextSpan(
                            style: DsTypography.caption.copyWith(color: DsColor.contentSecondary),
                            children: [
                              const TextSpan(text: '連続回答 '),
                              TextSpan(
                                text: '${p.streak}日',
                                style: const TextStyle(color: DsColor.actionPrimary, fontWeight: FontWeight.w700),
                              ),
                              const TextSpan(text: ' / 自己ベスト '),
                              TextSpan(
                                text: '${p.bestStreak}日',
                                style: const TextStyle(color: DsColor.actionEmphasis, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                ),
                if (done)
                  Text('次は ${p.untilNext.inHours}:${(p.untilNext.inMinutes % 60).toString().padLeft(2, '0')} 後', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))
                else
                  Text(
                    '挑戦する →',
                    style: DsTypography.caption.copyWith(color: DsColor.actionEmphasis, fontWeight: FontWeight.w700),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// ランクの内訳を 1 本の帯で示す。製品のドーナツの代わりに、横に積んで割合を読みやすくした。
class RankBar extends StatelessWidget {
  const RankBar({super.key});

  @override
  Widget build(BuildContext context) {
    final p = profile;
    final total = p.plays == 0 ? 1 : p.plays;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ClipRRect(
          borderRadius: DsRadius.borderXs,
          child: SizedBox(
            height: 14,
            child: p.plays == 0
                ? const ColoredBox(color: DsColor.disabledSurface)
                : Row(
                    children: [
                      for (final r in Rank.values)
                        if (p.count(r) > 0)
                          Expanded(
                            flex: p.count(r),
                            child: ColoredBox(color: dsRankColor(r.label)),
                          ),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: DsSpacing.space8),
        Wrap(
          spacing: DsSpacing.space16,
          runSpacing: DsSpacing.space4,
          children: [
            for (final r in Rank.values)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DsStatusDot(color: dsRankColor(r.label)),
                  const SizedBox(width: 4),
                  Text(r == Rank.miss ? '×' : r.label, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                  const SizedBox(width: 3),
                  Text('${(p.count(r) * 100 / total).round()}%', style: DsTypography.displayNumeric.copyWith(fontSize: 12, color: DsColor.contentPrimary)),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

/// 何日前かを、今日、昨日、日付（10/1（木））で書く。
String dayLabel(int day) {
  if (day == 0) return '今日';
  if (day == 1) return '昨日';
  final d = Profile.todayDate.subtract(Duration(days: day));
  return '${d.month}/${d.day}（${'月火水木金土日'[d.weekday - 1]}）';
}

/// 切り替えのセグメントコントロール。ヘッダーの下線と二重の線にならないよう、下線のタブでなく、1 つの枠の中の札で選ぶ。
/// 選んだ札は cyan の面に濃紺の文字と小さな影、選ばない札は地のまま。v2 の DsChip の選択の造形に合わせた。
class DsSegmented extends StatelessWidget {
  const DsSegmented({required this.labels, required this.index, required this.onChanged, super.key});

  final List<String> labels;
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) => Container(
    height: 44,
    padding: const EdgeInsets.all(3),
    decoration: BoxDecoration(
      color: DsColor.background,
      borderRadius: DsRadius.borderSm,
      border: Border.all(color: DsColor.disabledSurface),
    ),
    child: Row(
      children: [
        for (var i = 0; i < labels.length; i++)
          Expanded(
            child: Semantics(
              button: true,
              selected: i == index,
              label: labels[i],
              excludeSemantics: true,
              child: GestureDetector(
                onTap: () => onChanged(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 120),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: i == index ? DsColor.actionPrimary : Colors.transparent,
                    borderRadius: BorderRadius.circular(DsRadius.sm - 2),
                    border: i == index ? Border.all(color: DsColor.onAction, width: DsBorder.standard) : null,
                    boxShadow: i == index ? DsShadow.xs : null,
                  ),
                  child: Text(
                    labels[i],
                    style: DsTypography.body2.copyWith(color: i == index ? DsColor.onAction : DsColor.contentSecondary, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
          ),
      ],
    ),
  );
}

/// 結果の見出し。正誤の札、選手名、所属を縦に並べる。
class ResultHeading extends StatelessWidget {
  const ResultHeading({required this.session, super.key, this.verdict});

  final QuizSession session;

  /// 札の文言の上書き。
  final String? verdict;

  @override
  Widget build(BuildContext context) {
    final s = session;
    final won = s.status == QuizStatus.correct;
    final label = verdict ?? (won ? '正解！' : (s.status == QuizStatus.failed ? '3 回外れ' : 'ギブアップ'));
    return Column(
      children: [
        DsBadge(label: label, color: won ? DsColor.statusSuccess : DsColor.incorrect, shape: DsBadgeShape.chamfered, large: true),
        const SizedBox(height: DsSpacing.space12),
        Text(
          won ? s.player.name : '正解は ${s.player.name} 選手',
          textAlign: TextAlign.center,
          style: DsTypography.headline3.copyWith(color: DsColor.contentPrimary),
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            DsBadge(label: teamShort[s.player.team] ?? s.player.team, color: DsColor.contentPrimary),
            const SizedBox(width: DsSpacing.space8),
            Text('2025年シーズン終了時', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
          ],
        ),
      ],
    );
  }
}
