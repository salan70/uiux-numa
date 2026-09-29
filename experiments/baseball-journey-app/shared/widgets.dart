import 'package:flutter/material.dart';

import 'format.dart';
import 'model.dart';
import 'theme.dart';

enum PressKind { primary, secondary, destructive }

/// 押せる面。輪郭と右下の影を持ち、押すと影の分だけ沈む（ui_ux_concepts.md 8.2 の押し込み）。
/// 動きの抑制では沈まず、影だけが消える。押し先の位置は変わらない（States & Feedback）。
class PressButton extends StatefulWidget {
  const PressButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.kind = PressKind.secondary,
    this.icon,
    this.expand = true,
    this.busy = false,
    this.semanticsHint,
    this.dense = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final PressKind kind;
  final IconData? icon;
  final bool expand;

  /// 処理中。二重に押せないようにし（disableWhileLoading）、文言を変えず回転する印だけを足す。
  final bool busy;
  final String? semanticsHint;
  final bool dense;

  @override
  State<PressButton> createState() => _PressButtonState();
}

class _PressButtonState extends State<PressButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final enabled = widget.onPressed != null && !widget.busy;
    final reduced = Motion.reduced(context);
    final (fill, fg) = switch (widget.kind) {
      PressKind.primary => (p.primary, p.onPrimary),
      PressKind.secondary => (p.surface, p.onSurface),
      PressKind.destructive => (p.surface, p.error),
    };
    final offset = enabled && !_down ? Borders.shadowOffset : 0.0;
    final shift = enabled && _down && !reduced ? Borders.shadowOffset : 0.0;
    final content = Row(
      mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.busy)
          Padding(
            padding: const EdgeInsets.only(right: Space.s200),
            child: SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2, color: fg)),
          )
        else if (widget.icon != null)
          Padding(
            padding: const EdgeInsets.only(right: Space.s200),
            child: Icon(widget.icon, size: 20, color: enabled ? fg : p.onSurfaceVariant),
          ),
        Flexible(
          child: Text(
            widget.label,
            textAlign: TextAlign.center,
            style: Txt.control.copyWith(color: enabled || widget.busy ? fg : p.onSurfaceVariant),
          ),
        ),
      ],
    );
    return Semantics(
      button: true,
      enabled: enabled,
      hint: widget.semanticsHint,
      excludeSemantics: true,
      label: widget.label,
      onTap: enabled ? widget.onPressed : null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => setState(() => _down = true) : null,
        onTapCancel: () => setState(() => _down = false),
        onTapUp: enabled ? (_) => setState(() => _down = false) : null,
        onTap: enabled ? widget.onPressed : null,
        child: Padding(
          padding: const EdgeInsets.only(right: Borders.shadowOffset, bottom: Borders.shadowOffset),
          child: AnimatedContainer(
            duration: reduced ? Duration.zero : Motion.press,
            curve: Motion.out,
            transform: Matrix4.translationValues(shift, shift, 0),
            constraints: BoxConstraints(minHeight: widget.dense ? Sizes.controlMd : Sizes.controlLg),
            padding: EdgeInsets.symmetric(horizontal: widget.dense ? Space.s300 : Space.s400, vertical: Space.s200),
            decoration: BoxDecoration(
              color: enabled || widget.busy ? fill : p.surfaceContainer,
              borderRadius: BorderRadius.circular(Radii.control),
              border: Border.all(color: enabled ? p.ink : p.outline, width: Borders.thick),
              boxShadow: [BoxShadow(color: p.shadow, offset: Offset(offset, offset))],
            ),
            child: content,
          ),
        ),
      ),
    );
  }
}

/// 情報の面。押せないので影を持たない。
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child, this.padding = const EdgeInsets.all(Space.s400), this.color});

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? p.surface,
        borderRadius: BorderRadius.circular(Radii.surface),
        border: Border.all(color: p.ink, width: Borders.thick),
      ),
      child: child,
    );
  }
}

/// 押せる面（一覧の行やカード）。PressButton と同じ沈み方をする。
class PressCard extends StatefulWidget {
  const PressCard({super.key, required this.child, required this.onTap, this.label, this.selected = false});

  final Widget child;
  final VoidCallback? onTap;
  final String? label;
  final bool selected;

  @override
  State<PressCard> createState() => _PressCardState();
}

class _PressCardState extends State<PressCard> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final reduced = Motion.reduced(context);
    final enabled = widget.onTap != null;
    final offset = enabled && !_down ? Borders.shadowOffset : 0.0;
    final shift = _down && !reduced ? Borders.shadowOffset : 0.0;
    return Semantics(
      button: enabled,
      selected: widget.selected,
      label: widget.label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => setState(() => _down = true) : null,
        onTapCancel: () => setState(() => _down = false),
        onTapUp: enabled ? (_) => setState(() => _down = false) : null,
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.only(right: Borders.shadowOffset, bottom: Borders.shadowOffset),
          child: AnimatedContainer(
            duration: reduced ? Duration.zero : Motion.press,
            curve: Motion.out,
            transform: Matrix4.translationValues(shift, shift, 0),
            decoration: BoxDecoration(
              color: widget.selected ? p.secondaryContainer : p.surface,
              borderRadius: BorderRadius.circular(Radii.surface),
              border: Border.all(color: p.ink, width: Borders.thick),
              boxShadow: [BoxShadow(color: p.shadow, offset: Offset(offset, offset))],
            ),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.trailing});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: Space.s600, bottom: Space.s200),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Semantics(header: true, child: Text(text, style: Txt.heading)),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// 項目名と数。項目名を先に読ませる（「打率 .312」）。
class StatTile extends StatelessWidget {
  const StatTile({super.key, required this.label, required this.value, this.delta, this.large = true});

  final String label;
  final String value;

  /// 直前との差（「+.003」「+1」）。上がったときだけ強調する。
  final String? delta;
  final bool large;

  bool get _up => delta != null && !delta!.startsWith('−');

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      label: '$label ${value.replaceAll('---', 'なし')}${delta == null ? '' : '、$delta'}',
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          Text(value, style: (large ? Txt.figure : Txt.figureSm).copyWith(color: p.onSurface)),
          if (delta != null)
            Container(
              margin: const EdgeInsets.only(top: Space.s100),
              padding: const EdgeInsets.symmetric(horizontal: Space.s150, vertical: Space.s50),
              decoration: BoxDecoration(
                color: _up ? p.tertiaryContainer : p.surfaceContainer,
                borderRadius: BorderRadius.circular(Radii.control),
              ),
              child: Text(
                delta!,
                style: Txt.caption.merge(Txt.tabular).copyWith(color: _up ? p.onTertiaryContainer : p.onSurfaceVariant),
              ),
            ),
        ],
      ),
    );
  }
}

/// 今季の主要 6 項目。play_top.md の SeasonStatsCard の項目（打率、本塁打、打点、安打、盗塁、OPS）を保った。
class SeasonStatGrid extends StatelessWidget {
  const SeasonStatGrid({super.key, required this.line, this.before, this.large = true});

  final BattingLine line;
  final BattingLine? before;
  final bool large;

  @override
  Widget build(BuildContext context) {
    String? intDelta(int now, int? was) => was == null || now == was ? null : '+${now - was}';
    String? rateDelta(double? now, double? was) {
      if (before == null || now == null || was == null) return null;
      final d = now - was;
      return d.abs() < 0.0005 ? null : signedRate(d);
    }

    final b = before;
    final tiles = [
      StatTile(label: '打率', value: rate(line.average), delta: rateDelta(line.average, b?.average), large: large),
      StatTile(label: '本塁打', value: '${line.homeRuns}', delta: intDelta(line.homeRuns, b?.homeRuns), large: large),
      StatTile(label: '打点', value: '${line.rbi}', delta: intDelta(line.rbi, b?.rbi), large: large),
      StatTile(label: '安打', value: '${line.hits}', delta: intDelta(line.hits, b?.hits), large: large),
      StatTile(label: '盗塁', value: '${line.steals}', delta: intDelta(line.steals, b?.steals), large: large),
      StatTile(label: 'OPS', value: rate(line.ops), delta: rateDelta(line.ops, b?.ops), large: large),
    ];
    return LayoutBuilder(
      builder: (context, c) {
        // 文字を拡大して 3 列に収まらないときは 2 列にする。数を 1 字ずつ折り返さない。
        final scale = MediaQuery.textScalerOf(context).scale(1);
        final columns = c.maxWidth / scale < 300 ? 2 : 3;
        final width = (c.maxWidth - Space.s400 * (columns - 1)) / columns;
        return Wrap(
          spacing: Space.s400,
          runSpacing: Space.s400,
          children: [for (final t in tiles) SizedBox(width: width, child: t)],
        );
      },
    );
  }
}

/// 背番号の札。
class JerseyBadge extends StatelessWidget {
  const JerseyBadge(this.number, {super.key, this.size = 56});

  final int number;
  final double size;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      label: '背番号 $number',
      excludeSemantics: true,
      child: Container(
        constraints: BoxConstraints(minWidth: size, minHeight: size),
        alignment: Alignment.center,
        padding: const EdgeInsets.all(Space.s100),
        decoration: BoxDecoration(
          color: p.primary,
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: p.ink, width: Borders.thick),
        ),
        child: Text(
          '$number',
          style: Txt.figure.copyWith(fontSize: size * 0.46, color: p.onPrimary),
        ),
      ),
    );
  }
}

/// シーズンの進み。数を文字で添え、棒だけで伝えない。
class SeasonProgress extends StatelessWidget {
  const SeasonProgress({super.key, required this.season});

  final Season season;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final ratio = season.playedCount / season.totalGames;
    return Semantics(
      label: '${season.year} 年、${season.totalGames} 試合のうち ${season.playedCount} 試合を終えました',
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: double.infinity,
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              children: [
                Text(year(season.year), style: Txt.control),
                Text('${season.playedCount} / ${season.totalGames} 試合', style: Txt.ui.merge(Txt.tabular)),
              ],
            ),
          ),
          const SizedBox(height: Space.s150),
          Container(
            height: 12,
            decoration: BoxDecoration(
              color: p.surfaceContainer,
              borderRadius: BorderRadius.circular(Radii.pill),
              border: Border.all(color: p.ink, width: Borders.thick),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: ratio.clamp(0, 1),
              child: Container(
                decoration: BoxDecoration(color: p.secondary, borderRadius: BorderRadius.circular(Radii.pill)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// − 数 + の増減。上限に着いたら + を押せなくし、理由の行は常に確保して下の要素を動かさない。
class NumberStepper extends StatelessWidget {
  const NumberStepper({
    super.key,
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    this.unit = '',
    this.limitNote,
    this.floorNote,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;
  final String unit;

  /// 上限に着いたときの理由。
  final String? limitNote;

  /// 下限に着いたときの理由。
  final String? floorNote;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget button(IconData icon, String action, int next, bool enabled) => Semantics(
      button: true,
      enabled: enabled,
      label: '$label を$action',
      excludeSemantics: true,
      child: SizedBox.square(
        dimension: Sizes.target,
        child: IconButton.outlined(
          onPressed: enabled ? () => onChanged(next) : null,
          icon: Icon(icon),
          style: IconButton.styleFrom(
            side: BorderSide(color: enabled ? p.ink : p.surfaceVariant, width: Borders.thick),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.control)),
            foregroundColor: p.onSurface,
          ),
        ),
      ),
    );
    final atMax = value >= max && max > min;
    final atMin = value <= min && max > min;
    final note = atMax ? limitNote : (atMin ? floorNote : null);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: Txt.control)),
            button(Icons.remove, '1 減らす', value - 1, value > min),
            Semantics(
              liveRegion: true,
              label: '$label $value$unit',
              excludeSemantics: true,
              child: SizedBox(
                width: 56,
                child: Text(
                  '$value',
                  textAlign: TextAlign.center,
                  style: Txt.figureSm.copyWith(color: p.onSurface),
                ),
              ),
            ),
            button(Icons.add, '1 増やす', value + 1, value < max),
          ],
        ),
        if (limitNote != null || floorNote != null)
          Text(note ?? '', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ],
    );
  }
}

/// 1 つを選ぶ札の並び。選んだ札は面の色と印で示し、色だけに頼らない。
class ChoiceWrap<T> extends StatelessWidget {
  const ChoiceWrap({
    super.key,
    required this.values,
    required this.label,
    required this.isSelected,
    required this.onSelected,
    this.semanticsLabel,
  });

  final List<T> values;
  final String Function(T) label;
  final bool Function(T) isSelected;
  final ValueChanged<T> onSelected;
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      label: semanticsLabel,
      container: semanticsLabel != null,
      child: Wrap(
        spacing: Space.s200,
        runSpacing: Space.s200,
        children: [
          for (final v in values)
            Semantics(
              selected: isSelected(v),
              button: true,
              child: InkWell(
                onTap: () => onSelected(v),
                borderRadius: BorderRadius.circular(Radii.control),
                // 選んだ印は札の角に重ね、選んでも札の幅と字の位置を変えない。
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    AnimatedContainer(
                      duration: Motion.reduced(context) ? Duration.zero : Motion.state,
                      constraints: const BoxConstraints(minHeight: Sizes.target, minWidth: Sizes.target),
                      padding: const EdgeInsets.symmetric(horizontal: Space.s300),
                      decoration: BoxDecoration(
                        color: isSelected(v) ? p.secondaryContainer : p.surface,
                        borderRadius: BorderRadius.circular(Radii.control),
                        border: Border.all(color: isSelected(v) ? p.ink : p.outline, width: Borders.thick),
                      ),
                      // 短い字でも最小幅の中央に置く。Align の factor 1 で札を中身の幅に保つ。
                      child: Align(
                        widthFactor: 1,
                        heightFactor: 1,
                        child: Text(
                          label(v),
                          style: Txt.control.copyWith(color: isSelected(v) ? p.onSecondaryContainer : p.onSurface),
                        ),
                      ),
                    ),
                    if (isSelected(v))
                      Positioned(
                        top: -Space.s150,
                        right: -Space.s150,
                        child: Container(
                          padding: const EdgeInsets.all(Space.s50),
                          decoration: BoxDecoration(
                            color: p.secondary,
                            shape: BoxShape.circle,
                            border: Border.all(color: p.ink, width: Borders.thick),
                          ),
                          child: Icon(Icons.check, size: 12, color: p.onPrimary),
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

/// ラベルと値の 1 行。値が長ければ次の行へ送る。
class FactRow extends StatelessWidget {
  const FactRow(this.label, this.value, {super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.s150),
      child: Wrap(
        spacing: Space.s300,
        children: [
          SizedBox(
            width: 128,
            child: Text(label, style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
          ),
          Text(value, style: Txt.ui),
        ],
      ),
    );
  }
}

/// 空の状態。起きていることと次の行動を 2 文以内で書き、行動のボタンを添える（UX Writing）。
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.message, this.action, this.icon = Icons.sports_baseball});

  final String message;
  final Widget? action;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.all(Space.s600),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 56, color: p.primaryText),
          const SizedBox(height: Space.s400),
          Text(message, textAlign: TextAlign.center, style: Txt.body),
          if (action != null) ...[const SizedBox(height: Space.s500), action!],
        ],
      ),
    );
  }
}

/// 選手の見出し。名前、背番号、球団、守備位置、投打、年齢、年数。
class PlayerHeader extends StatelessWidget {
  const PlayerHeader({super.key, required this.player, this.compact = false});

  final Player player;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    final facts = [
      s.team.abbreviation,
      player.mainPosition.label,
      player.handedness,
      if (player.isActive) ...[
        '${player.age} 歳',
        'プロ ${player.proYears} 年目',
      ] else
        '${player.seasons.first.year}〜${s.year} 年・引退',
    ];
    return Row(
      children: [
        JerseyBadge(s.uniformNumber, size: compact ? 44 : 56),
        const SizedBox(width: Space.s300),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(header: true, child: Text(player.name, style: compact ? Txt.heading : Txt.title)),
              Text(facts.join('・'), style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            ],
          ),
        ),
      ],
    );
  }
}

Future<bool> confirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirm,
  String cancel = 'キャンセル',
  bool destructive = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    animationStyle: sheetAnimation(context),
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        PressButton(label: cancel, expand: false, dense: true, onPressed: () => Navigator.pop(context, false)),
        PressButton(
          label: confirm,
          expand: false,
          dense: true,
          kind: destructive ? PressKind.destructive : PressKind.primary,
          onPressed: () => Navigator.pop(context, true),
        ),
      ],
    ),
  );
  return result ?? false;
}

/// 通算の節目。絵文字は環境で形が変わるので使わず、印と文字で示す（Japanese Notation）。
class MilestoneBanner extends StatelessWidget {
  const MilestoneBanner({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      liveRegion: true,
      label: '記録達成、$text',
      excludeSemantics: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s200),
        decoration: BoxDecoration(
          color: p.tertiary,
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: p.ink, width: Borders.thick),
        ),
        child: Row(
          children: [
            Icon(Icons.emoji_events, color: p.onPrimary),
            const SizedBox(width: Space.s200),
            Expanded(
              child: Text(text, style: Txt.heading.copyWith(color: p.onPrimary)),
            ),
          ],
        ),
      ),
    );
  }
}
