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
                Text(title, style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                const Spacer(),
                DsStatusDot(color: done ? DsColor.statusSuccess : DsColor.statusPending),
                const SizedBox(width: 6),
                Text(done ? 'プレイ済み' : '未プレイ', style: DsTypography.caption.copyWith(color: done ? DsColor.statusSuccess : DsColor.statusPending, fontWeight: FontWeight.w700)),
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
                              TextSpan(text: '${p.streak}日', style: const TextStyle(color: DsColor.actionPrimary, fontWeight: FontWeight.w700)),
                              const TextSpan(text: ' / 自己ベスト '),
                              TextSpan(text: '${p.bestStreak}日', style: const TextStyle(color: DsColor.actionEmphasis, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                ),
                if (done)
                  Text('次は ${p.untilNext.inHours}:${(p.untilNext.inMinutes % 60).toString().padLeft(2, '0')} 後', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary))
                else
                  Text('挑戦する →', style: DsTypography.caption.copyWith(color: DsColor.actionEmphasis, fontWeight: FontWeight.w700)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// いまの出題の条件を読むだけのシート。条件を変える画面は round 2 で作る。
void showConditionSheet(BuildContext context) {
  Widget chips(List<String> items) => Wrap(
    spacing: 6,
    runSpacing: 6,
    children: [for (final t in items) DsBadge(label: t, color: DsColor.actionPrimary)],
  );
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (_) => DsSurface(
      backgroundColor: DsColor.background,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(DsRadius.lg)),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('いまの条件', style: DsTypography.headline4.copyWith(color: DsColor.contentPrimary)),
              const SizedBox(height: DsSpacing.space12),
              Text('球団', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
              const SizedBox(height: 4),
              chips(teamOrder),
              const SizedBox(height: DsSpacing.space12),
              Text('出題する選手', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
              const SizedBox(height: 4),
              chips(const ['通算 300 試合以上', '300 安打以上', '50 本塁打以上']),
              const SizedBox(height: DsSpacing.space12),
              Text('出題する成績', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
              const SizedBox(height: 4),
              chips(defaultStats),
              const SizedBox(height: DsSpacing.space16),
              Text('条件を変える画面は、方向が決まってから作ります。', style: DsTypography.caption.copyWith(color: DsColor.disabledContent)),
            ],
          ),
        ),
      ),
    ),
  );
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
                        if (p.count(r) > 0) Expanded(flex: p.count(r), child: ColoredBox(color: dsRankColor(r.label))),
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

/// 履歴の一覧。日付、今日の1問の札、選手、開示の割合、ランクを 1 行に並べる。
class HistoryList extends StatelessWidget {
  const HistoryList({super.key, this.limit = 12, this.rankLabel});

  final int limit;

  /// ランクの札の読み替え（打球の名など）。
  final String Function(Rank)? rankLabel;

  @override
  Widget build(BuildContext context) {
    final records = profile.records.take(limit).toList();
    if (records.isEmpty) {
      return DsCard(child: Text('まだ記録がありません。1 問解くとここに残ります。', style: DsTypography.body2.copyWith(color: DsColor.contentSecondary)));
    }
    return Column(
      children: [
        for (final r in records)
          Padding(
            padding: const EdgeInsets.only(bottom: DsSpacing.space8),
            child: DsSurface(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              accentColor: r.daily ? DsColor.actionEmphasis : null,
              accentSize: 12,
              child: Row(
                children: [
                  SizedBox(
                    width: 44,
                    child: Text(r.day == 0 ? '今日' : (r.day == 1 ? '昨日' : '${r.day}日前'), style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.player.name, style: DsTypography.body2.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700)),
                        Text('${r.daily ? '今日の1問' : 'ノーマル'}・開示 ${r.unveilPercent}%', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                      ],
                    ),
                  ),
                  DsBadge(label: rankLabel?.call(r.rank) ?? (r.rank == Rank.miss ? '不正解' : r.rank.label), color: dsRankColor(r.rank.label)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// 2 つの見出しを切り替えるタブ。製品のプレイ記録の「統計 / 履歴」に倣い、選んだ方に cyan の下線を引く。
class DsTabs extends StatelessWidget {
  const DsTabs({required this.labels, required this.index, required this.onChanged, super.key});

  final List<String> labels;
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      for (var i = 0; i < labels.length; i++)
        Expanded(
          child: InkWell(
            onTap: () => onChanged(i),
            child: Container(
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: i == index ? DsColor.actionPrimary : DsColor.disabledSurface, width: i == index ? DsBorder.standard : DsBorder.thin)),
              ),
              child: Text(labels[i], style: DsTypography.body1.copyWith(color: i == index ? DsColor.actionPrimary : DsColor.contentSecondary, fontWeight: FontWeight.w700)),
            ),
          ),
        ),
    ],
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
        Text(won ? s.player.name : '正解は ${s.player.name} 選手', textAlign: TextAlign.center, style: DsTypography.headline3.copyWith(color: DsColor.contentPrimary)),
        Text('${teamShort[s.player.team] ?? s.player.team}・2025年シーズン終了時', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
      ],
    );
  }
}
