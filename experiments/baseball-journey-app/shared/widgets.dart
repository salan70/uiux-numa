import 'package:flutter/material.dart';

import 'format.dart';
import 'model.dart';
import 'parts.dart';
import 'pixel.dart';
import 'theme.dart';

enum PressKind { primary, secondary, destructive }

/// 押せる面。KeyButton に種類ごとの面の色を渡す。押し込みと処理中の扱いは KeyButton にある。
class PressButton extends StatelessWidget {
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
  final bool busy;
  final String? semanticsHint;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return KeyButton(
      label: label,
      onPressed: onPressed,
      fill: kind == PressKind.primary ? p.primary : p.surface,
      foreground: kind == PressKind.destructive ? p.error : null,
      icon: icon,
      busy: busy,
      expand: expand,
      semanticsHint: semanticsHint,
      height: dense ? Sizes.controlMd : Sizes.target,
    );
  }
}

/// 情報の面。BoldBox を幅いっぱいに広げる。
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child, this.padding = const EdgeInsets.all(Space.s400), this.color});

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: BoldBox(color: color, padding: padding, child: child),
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
    final offset = enabled && !_down ? Bold.shadow : 0.0;
    final shift = _down && !reduced ? Bold.shadow : 0.0;
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
          padding: const EdgeInsets.only(right: Bold.shadow, bottom: Bold.shadow),
          child: AnimatedContainer(
            duration: reduced ? Duration.zero : Motion.press,
            curve: Motion.out,
            transform: Matrix4.translationValues(shift, shift, 0),
            decoration: BoxDecoration(
              color: widget.selected ? p.secondaryContainer : p.surface,
              borderRadius: BorderRadius.circular(Bold.radius),
              border: Border.all(color: p.ink, width: Bold.border),
              boxShadow: [BoxShadow(color: p.shadow, offset: Offset(offset, offset))],
            ),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}

/// 節の見出し。升と同じ黄の小さな角を頭に置き、diamond の升と札の造形に揃える。
class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.trailing});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: Space.s600, bottom: Space.s300),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 12,
            height: 12,
            margin: const EdgeInsets.only(right: Space.s200),
            decoration: BoxDecoration(color: p.primary, border: Border.all(color: p.ink, width: Borders.thick)),
          ),
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
                border: Border.all(color: p.ink, width: Borders.thick),
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

  final String number;
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
          number,
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

/// − 数 + の増減。RubberStepper に写し、上限と下限では押し返しと理由の行で伝える。
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.s100),
      child: RubberStepper(
        label: label,
        value: value,
        min: min,
        max: max,
        unit: unit,
        onChanged: onChanged,
        limitNote: limitNote,
        floorNote: floorNote,
      ),
    );
  }
}

/// 選ぶ札の並び。選んだ札は押し込んだ鍵のように沈め、面の色と角の印を添える。色だけに頼らない。
/// 複数を選べる並びにも使う（isSelected が複数に true を返す）。
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

  static const _depth = 3.0;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final reduced = Motion.reduced(context);
    return Semantics(
      label: semanticsLabel,
      container: semanticsLabel != null,
      child: Wrap(
        spacing: Space.s200 - _depth,
        runSpacing: Space.s200 - _depth,
        children: [
          for (final v in values)
            Semantics(
              selected: isSelected(v),
              button: true,
              child: InkWell(
                onTap: () => onSelected(v),
                borderRadius: BorderRadius.circular(Radii.control),
                child: Padding(
                  padding: const EdgeInsets.only(right: _depth, bottom: _depth),
                  // 選んだ印は札の角に重ね、選んでも札の幅と字の位置を変えない。
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      AnimatedContainer(
                        duration: reduced ? Duration.zero : Motion.state,
                        curve: Motion.out,
                        transform: Matrix4.translationValues(
                          isSelected(v) && !reduced ? _depth : 0,
                          isSelected(v) && !reduced ? _depth : 0,
                          0,
                        ),
                        constraints: const BoxConstraints(minHeight: Sizes.target, minWidth: Sizes.target),
                        padding: const EdgeInsets.symmetric(horizontal: Space.s300),
                        decoration: BoxDecoration(
                          color: isSelected(v) ? p.secondaryContainer : p.surface,
                          borderRadius: BorderRadius.circular(Radii.control),
                          border: Border.all(color: p.ink, width: Borders.thick),
                          boxShadow: isSelected(v)
                              ? null
                              : [BoxShadow(color: p.shadow, offset: const Offset(_depth, _depth))],
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
                          top: -Space.s150 + _depth,
                          right: -Space.s150 - _depth,
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

/// 選手の見出し。PlayerCard の球団の帯とドット絵を、名前と経歴の 1 枚に縮めた。
/// 引退した選手は帯を灰にする。
class PlayerHeader extends StatelessWidget {
  const PlayerHeader({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    final band = player.isActive ? teamColor(s.team) : p.outline;
    final bandInk = inkOn(band);
    final facts = [
      player.mainPosition.label,
      player.handedness,
      if (player.isActive) ...[
        '${player.age} 歳',
        'プロ ${player.proYears} 年目',
      ] else
        '${player.seasons.first.year}〜${s.year} 年・引退',
    ];
    return BoldBox(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(Bold.radius - Bold.border),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              color: band,
              padding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s100),
              child: Row(
                children: [
                  Expanded(child: Text(s.team.name, style: Txt.control.copyWith(color: bandInk))),
                  Semantics(
                    label: '背番号 ${s.uniformNumber}',
                    excludeSemantics: true,
                    child: Text('#${s.uniformNumber}', style: Txt.control.merge(Txt.tabular).copyWith(color: bandInk)),
                  ),
                ],
              ),
            ),
            Container(height: Bold.border, color: p.ink),
            Padding(
              padding: const EdgeInsets.all(Space.s300),
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: p.secondaryContainer,
                      borderRadius: BorderRadius.circular(Radii.control),
                      border: Border.all(color: p.ink, width: Borders.thick),
                    ),
                    padding: const EdgeInsets.all(Space.s100),
                    child: PixelAvatar(player: player, size: 56),
                  ),
                  const SizedBox(width: Space.s300),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Semantics(header: true, child: Text(player.name, style: Txt.title)),
                        Text(facts.join('・'), style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                      ],
                    ),
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
          border: Border.all(color: p.ink, width: Bold.border),
          boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(Bold.shadow, Bold.shadow))],
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
