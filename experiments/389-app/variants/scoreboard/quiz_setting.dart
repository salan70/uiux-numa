import 'package:flutter/material.dart';

import '../../shared/data.dart';
import '../../shared/ds.dart';
import '../../shared/icons.dart';

// クイズ設定の画面。製品の quiz_setting_page と DESIGN.md の Pattern B に従う。
// 項目を DsCard で縦に積み、隅のアクセントの色で項目を見分ける（球団 cyan、選手の条件 yellow、出題する成績 pink、表示間隔 green）。
// 選択は画面の中の札で完結させ、モーダルへ逃がさない。下端の帯にプレイモードとプレイのボタンを置く。
// 製品から変えた点:
// - 下限の 3 つを、ドロップダウンから札の並びに替えた。候補が 5 つずつなので、開かずに全部を見比べられる。
// - 条件に合う選手の数を、下端の帯に出す。0 人になる組み合わせは、プレイのボタンを押せなくして理由を出す（要件 T-5）。

class QuizSettingScreen extends StatefulWidget {
  const QuizSettingScreen({required this.onPlay, super.key});

  /// プレイのボタンを押したとき。
  final VoidCallback onPlay;

  @override
  State<QuizSettingScreen> createState() => _QuizSettingScreenState();
}

class _QuizSettingScreenState extends State<QuizSettingScreen> {
  QuizCondition get c => QuizCondition.current;

  void _toggleTeam(String t) => setState(() => c.teams.contains(t) ? c.teams.remove(t) : c.teams.add(t));

  void _toggleStat(String st) => setState(() {
    if (c.stats.contains(st)) {
      c.stats.remove(st);
    } else if (c.stats.length < QuizCondition.statCount) {
      c.stats.add(st);
    }
  });

  @override
  Widget build(BuildContext context) {
    final count = c.players.length;
    final full = c.stats.length == QuizCondition.statCount;
    final problem = c.teams.isEmpty ? '球団を 1 つ以上選んでください' : (!full ? '出題する成績を 4 つ選んでください' : (count == 0 ? '条件に合う選手がいません' : null));
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(
            title: 'クイズ設定',
            leading: DsHeaderIconButton(icon: DsGlyph.chevronLeft, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop()),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _Section(
                  title: '球団',
                  accent: DsColor.actionPrimary,
                  trailing: DsButton(
                    label: c.teams.length == teamOrder.length ? 'すべて外す' : 'すべて選ぶ',
                    type: DsButtonType.text,
                    onPressed: () => setState(() => c.teams.length == teamOrder.length ? c.teams.clear() : c.teams.addAll(teamOrder)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final (league, teams) in const [
                        ('セ・リーグ', ['巨人', '阪神', 'DeNA', '広島', 'ヤクルト', '中日']),
                        ('パ・リーグ', ['ソフトバンク', '日本ハム', 'ロッテ', '楽天', 'オリックス', '西武']),
                      ]) ...[
                        Text(league, style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [for (final t in teams) _Chip(label: t, selected: c.teams.contains(t), onTap: () => _toggleTeam(t))],
                        ),
                        const SizedBox(height: DsSpacing.space12),
                      ],
                    ],
                  ),
                ),
                _Section(
                  title: '出題する選手の条件',
                  accent: DsColor.rankHighlight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _Steps(label: '通算試合', unit: '試合', options: QuizCondition.gamesOptions, value: c.minGames, onChanged: (v) => setState(() => c.minGames = v)),
                      const SizedBox(height: DsSpacing.space16),
                      _Steps(label: '通算安打', unit: '安打', options: QuizCondition.hitsOptions, value: c.minHits, onChanged: (v) => setState(() => c.minHits = v)),
                      const SizedBox(height: DsSpacing.space16),
                      _Steps(label: '通算本塁打', unit: '本', options: QuizCondition.hrOptions, value: c.minHr, onChanged: (v) => setState(() => c.minHr = v)),
                    ],
                  ),
                ),
                _Section(
                  title: '出題する成績',
                  accent: DsColor.actionEmphasis,
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      DsDisplayNumber('${c.stats.length}', fontSize: 20, color: full ? DsColor.actionEmphasis : DsColor.contentPrimary),
                      DsDisplayNumber(' / ${QuizCondition.statCount}', fontSize: 14, color: DsColor.contentSecondary),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 選んだ順に、表の列の並びになる。選んだ成績を先に、列の順で見せる。
                      Row(
                        children: [
                          for (var i = 0; i < QuizCondition.statCount; i++) ...[
                            Expanded(
                              child: _Slot(label: i < c.stats.length ? c.stats[i] : null, index: i + 1, onTap: i < c.stats.length ? () => _toggleStat(c.stats[i]) : null),
                            ),
                            if (i < QuizCondition.statCount - 1) const SizedBox(width: 6),
                          ],
                        ],
                      ),
                      const SizedBox(height: DsSpacing.space12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [for (final st in statColumns) _Chip(label: st, selected: c.stats.contains(st), enabled: c.stats.contains(st) || !full, onTap: () => _toggleStat(st))],
                      ),
                    ],
                  ),
                ),
                if (c.timer)
                  _Section(
                    title: '表示間隔',
                    accent: DsColor.statusSuccess,
                    child: Row(
                      children: [
                        _Round(
                          icon: '−',
                          onTap: c.interval > QuizCondition.minInterval ? () => setState(() => c.interval = (c.interval - 0.1).clamp(QuizCondition.minInterval, QuizCondition.maxInterval)) : null,
                        ),
                        Expanded(
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  DsDisplayNumber(c.interval.toStringAsFixed(1), fontSize: 36, color: DsColor.statusSuccess),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4, left: 4),
                                    child: Text('秒ごと', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                                  ),
                                ],
                              ),
                              Text('0.3 から 5.0 秒まで', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
                            ],
                          ),
                        ),
                        _Round(
                          icon: '+',
                          onTap: c.interval < QuizCondition.maxInterval ? () => setState(() => c.interval = (c.interval + 0.1).clamp(QuizCondition.minInterval, QuizCondition.maxInterval)) : null,
                        ),
                      ],
                    ),
                  ),
                Text('成績は 2025 年シーズン終了時のものです。', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
              ],
            ),
          ),
          DsBottomActionBar(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _ModeCard(title: 'マニュアル', note: '1 つずつ自分で開く', selected: !c.timer, onTap: () => setState(() => c.timer = false)),
                    ),
                    const SizedBox(width: DsSpacing.space8),
                    Expanded(
                      child: _ModeCard(title: 'タイマー', note: '一定の間隔で開く', selected: c.timer, onTap: () => setState(() => c.timer = true)),
                    ),
                  ],
                ),
                const SizedBox(height: DsSpacing.space12),
                DsButton(label: c.timer ? 'タイマーモードでプレイ！' : 'マニュアルモードでプレイ！', icon: DsGlyph.baseball, onPressed: problem == null ? widget.onPlay : null),
                const SizedBox(height: 6),
                Text(
                  problem ?? '条件に合う選手 $count 人',
                  textAlign: TextAlign.center,
                  style: DsTypography.caption.copyWith(color: problem == null ? DsColor.contentSecondary : DsColor.incorrect),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.accent, required this.child, this.trailing});

  final String title;
  final Color accent;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: DsSpacing.space16),
    child: DsCard(
      accentColor: accent,
      hasShadow: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            height: 32,
            child: Row(
              children: [
                Text(
                  title,
                  style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                ?trailing,
              ],
            ),
          ),
          const SizedBox(height: DsSpacing.space8),
          child,
        ],
      ),
    ),
  );
}

/// 選ぶ札。製品の DsChip と同じく、選ぶと cyan の面に 2px の濃紺の輪郭と小さな影、選ばないと 1px の輪郭。
class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected, required this.onTap, this.enabled = true});

  final String label;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    enabled: enabled,
    label: label,
    excludeSemantics: true,
    child: GestureDetector(
      onTap: enabled ? onTap : null,
      child: Opacity(
        opacity: enabled ? 1 : 0.35,
        // 札は中身の幅にする。alignment を付けると Wrap の中で横いっぱいに伸びるので、上下の余白で高さを作る。
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: selected ? DsColor.actionPrimary : DsColor.surface,
            borderRadius: DsRadius.borderSm,
            border: Border.all(color: selected ? DsColor.onAction : DsColor.surfaceBorder, width: selected ? DsBorder.standard : DsBorder.thin),
            boxShadow: selected ? DsShadow.xs : null,
          ),
          child: Text(
            label,
            style: DsTypography.body2.copyWith(color: selected ? DsColor.onAction : DsColor.contentPrimary, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    ),
  );
}

/// 下限の段。見出しと選んだ値を上に、5 つの候補を同じ幅の札で並べる。
class _Steps extends StatelessWidget {
  const _Steps({required this.label, required this.unit, required this.options, required this.value, required this.onChanged});

  final String label;
  final String unit;
  final List<int> options;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(label, style: DsTypography.body2.copyWith(color: DsColor.contentPrimary)),
          const Spacer(),
          Text(
            value == 0 ? '下限なし' : '$value $unit以上',
            style: DsTypography.caption.copyWith(color: DsColor.rankHighlight, fontWeight: FontWeight.w700),
          ),
        ],
      ),
      const SizedBox(height: 6),
      Row(
        children: [
          for (final (i, o) in options.indexed) ...[
            Expanded(
              child: Semantics(
                button: true,
                selected: o == value,
                label: o == 0 ? '$label 下限なし' : '$label $o $unit以上',
                excludeSemantics: true,
                child: GestureDetector(
                  onTap: () => onChanged(o),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 120),
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: o == value ? DsColor.rankHighlight : DsColor.background,
                      borderRadius: DsRadius.borderXs,
                      border: Border.all(color: o == value ? DsColor.onAction : DsColor.disabledSurface, width: o == value ? DsBorder.standard : DsBorder.thin),
                      boxShadow: o == value ? DsShadow.xs : null,
                    ),
                    child: o == 0
                        ? Text(
                            'なし',
                            style: DsTypography.caption.copyWith(color: o == value ? DsColor.onAction : DsColor.contentSecondary, fontWeight: FontWeight.w700),
                          )
                        : DsDisplayNumber('$o', fontSize: 15, color: o == value ? DsColor.onAction : DsColor.contentPrimary),
                  ),
                ),
              ),
            ),
            if (i < options.length - 1) const SizedBox(width: 4),
          ],
        ],
      ),
    ],
  );
}

/// 出題する成績の枠。選んだ順に表の列になるので、列の番号を添える。押すと外す。
class _Slot extends StatelessWidget {
  const _Slot({required this.label, required this.index, required this.onTap});

  final String? label;
  final int index;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      decoration: BoxDecoration(
        color: label == null ? DsColor.background : DsColor.surface,
        borderRadius: DsRadius.borderSm,
        border: Border.all(color: label == null ? DsColor.disabledSurface : DsColor.actionEmphasis, width: label == null ? DsBorder.thin : DsBorder.standard),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('$index 列目', style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0, height: 1.2)),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              label ?? '未選択',
              style: DsTypography.body2.copyWith(color: label == null ? DsColor.disabledContent : DsColor.contentPrimary, fontWeight: FontWeight.w700, height: 1.3),
            ),
          ),
        ],
      ),
    ),
  );
}

/// プレイモードの札。製品の PlayModeSelector と同じく、選ぶと cyan の輪郭と影で浮かせる。
class _ModeCard extends StatelessWidget {
  const _ModeCard({required this.title, required this.note, required this.selected, required this.onTap});

  final String title;
  final String note;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    label: '$title。$note',
    excludeSemantics: true,
    child: GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: DsColor.surface,
          borderRadius: DsRadius.borderSm,
          border: Border.all(color: selected ? DsColor.actionPrimary : DsColor.disabledSurface, width: selected ? DsBorder.standard : DsBorder.thin),
          boxShadow: selected ? DsShadow.small : null,
        ),
        child: Column(
          children: [
            Text(
              title,
              style: DsTypography.body2.copyWith(color: selected ? DsColor.actionPrimary : DsColor.contentSecondary, fontWeight: FontWeight.w700),
            ),
            Text(note, style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
          ],
        ),
      ),
    ),
  );
}

/// 表示間隔の増減の丸いボタン。
class _Round extends StatelessWidget {
  const _Round({required this.icon, required this.onTap});

  final String icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    enabled: onTap != null,
    label: icon == '+' ? '間隔を延ばす' : '間隔を縮める',
    excludeSemantics: true,
    child: GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: onTap == null ? DsColor.disabledSurface : DsColor.surface,
          shape: BoxShape.circle,
          border: Border.all(color: onTap == null ? DsColor.disabledSurface : DsColor.surfaceBorder, width: DsBorder.standard),
        ),
        child: Text(icon, style: DsTypography.headline4.copyWith(color: onTap == null ? DsColor.disabledContent : DsColor.contentPrimary, height: 1)),
      ),
    ),
  );
}
