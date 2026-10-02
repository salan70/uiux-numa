import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import 'icons.dart';

// .389 の Design System v2 を写す。出典は salan70/389-app 10adac47 の DESIGN.md と packages/common/design_system。
// 値と造形は製品に合わせ、試作で足したものはコメントで示す。
// アイコンは icons.dart の DsIcon（製品の DsSvgIcon の線画を写したもの）を使う。

abstract final class DsPalette {
  static const navy950 = Color(0xFF0E1624);
  static const navy900 = Color(0xFF152033);
  static const white = Color(0xFFFFFFFF);
  static const slate300 = Color(0xFFB8C2D1);
  static const cyan400 = Color(0xFF11C5CF);
  static const pink400 = Color(0xFFFF387D);
  static const yellow400 = Color(0xFFFFD22E);
  static const green400 = Color(0xFF2ECC71);
  static const orange400 = Color(0xFFFFA42B);
  static const black = Color(0xFF06101A);
  static const disabledSurface = Color(0xFF344052);
  static const disabledContent = Color(0xFF6B7687);
}

abstract final class DsColor {
  static const background = DsPalette.navy950;
  static const surface = DsPalette.navy900;
  static const surfaceBorder = DsPalette.slate300;
  static const contentPrimary = DsPalette.white;
  static const contentSecondary = DsPalette.slate300;
  static const actionPrimary = DsPalette.cyan400;
  static const actionEmphasis = DsPalette.pink400;
  static const onAction = DsPalette.navy950;
  static const statusSuccess = DsPalette.green400;
  static const statusPending = DsPalette.pink400;
  static const rankHighlight = DsPalette.yellow400;
  static const disabledSurface = DsPalette.disabledSurface;
  static const disabledContent = DsPalette.disabledContent;
  static const shadow = DsPalette.black;
  static const scrim = Color(0xB306101A);
  static const rankSs = DsPalette.cyan400;
  static const rankS = DsPalette.green400;
  static const rankA = DsPalette.yellow400;
  static const rankB = DsPalette.orange400;
  static const rankC = DsPalette.slate300;
  static const incorrect = DsPalette.pink400;
}

abstract final class DsSpacing {
  static const space4 = 4.0;
  static const space8 = 8.0;
  static const space12 = 12.0;
  static const space16 = 16.0;
  static const space20 = 20.0;
  static const space24 = 24.0;
  static const space32 = 32.0;
  static const space40 = 40.0;
  static const space56 = 56.0;
}

abstract final class DsRadius {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const borderXs = BorderRadius.all(Radius.circular(xs));
  static const borderSm = BorderRadius.all(Radius.circular(sm));
  static const borderMd = BorderRadius.all(Radius.circular(md));
}

abstract final class DsBorder {
  static const thin = 1.0;
  static const standard = 2.0;
  static const strong = 3.0;
}

abstract final class DsShadow {
  static const none = <BoxShadow>[];
  static const xs = [BoxShadow(color: DsColor.shadow, offset: Offset(0, 2))];
  static const small = [BoxShadow(color: DsColor.shadow, offset: Offset(0, 4))];
  static const medium = [BoxShadow(color: DsColor.shadow, offset: Offset(0, 6))];
  static const large = [BoxShadow(color: DsColor.shadow, offset: Offset(0, 8))];
}

abstract final class DsTypography {
  static const bodyFamily = 'RocknRoll One';
  static const displayFamily = 'Oxanium';

  /// Oxanium は可変の書体なので、太さを軸で指定する。
  static const _bold = [FontVariation('wght', 700)];

  static const displayNumericHero = TextStyle(fontFamily: displayFamily, fontSize: 36, fontWeight: FontWeight.w700, height: 1, letterSpacing: 0.4, fontVariations: _bold);
  static const displayNumeric = TextStyle(fontFamily: displayFamily, fontSize: 32, fontWeight: FontWeight.w700, height: 1, letterSpacing: 0.4, fontVariations: _bold);
  static const displayNumericSm = TextStyle(fontFamily: displayFamily, fontSize: 24, fontWeight: FontWeight.w700, height: 1, letterSpacing: 0.4, fontVariations: _bold);
  static const headline1 = TextStyle(fontFamily: bodyFamily, fontSize: 32, fontWeight: FontWeight.w700, height: 1.25);
  static const headline3 = TextStyle(fontFamily: bodyFamily, fontSize: 24, fontWeight: FontWeight.w600, height: 1.35);
  static const headline4 = TextStyle(fontFamily: bodyFamily, fontSize: 20, fontWeight: FontWeight.w600, height: 1.4);
  static const body1 = TextStyle(fontFamily: bodyFamily, fontSize: 16, height: 1.5);
  static const body2 = TextStyle(fontFamily: bodyFamily, fontSize: 14, height: 1.5);
  static const button = TextStyle(fontFamily: bodyFamily, fontSize: 16, fontWeight: FontWeight.w600, height: 1.5);
  static const caption = TextStyle(fontFamily: bodyFamily, fontSize: 12, height: 1.5);
  static const overline = TextStyle(fontFamily: bodyFamily, fontSize: 10, height: 1.5, letterSpacing: 1.5);
}

/// 試作の起点となるテーマ。Material の影と波紋を消し、面と影は Ds の部品で描く。
ThemeData buildDsTheme() => ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  fontFamily: DsTypography.bodyFamily,
  scaffoldBackgroundColor: DsColor.background,
  splashFactory: NoSplash.splashFactory,
  highlightColor: Colors.transparent,
  colorScheme: const ColorScheme.dark(primary: DsColor.actionPrimary, secondary: DsColor.actionEmphasis, surface: DsColor.surface, onSurface: DsColor.contentPrimary),
  textSelectionTheme: const TextSelectionThemeData(cursorColor: DsColor.actionPrimary),
  bottomSheetTheme: const BottomSheetThemeData(backgroundColor: DsColor.background, surfaceTintColor: Colors.transparent, elevation: 0),
);

bool dsStill(BuildContext context) => MediaQuery.disableAnimationsOf(context);

// ───────────────────────── 面 ─────────────────────────

enum DsCorner { topLeft, topRight, bottomLeft, bottomRight }

/// v2 のすべての面の基礎。枠、角丸、ハードシャドウ、背景の装飾、隅の三角を持つ。
class DsSurface extends StatelessWidget {
  const DsSurface({
    required this.child,
    super.key,
    this.backgroundColor = DsColor.surface,
    this.borderColor = DsColor.surfaceBorder,
    this.borderWidth = DsBorder.thin,
    this.borderRadius = DsRadius.borderSm,
    this.padding = EdgeInsets.zero,
    this.shadow = DsShadow.none,
    this.dotGrid = false,
    this.accentColor,
    this.accentPosition = DsCorner.bottomRight,
    this.accentSize = DsSpacing.space20,
  });

  final Widget child;
  final Color backgroundColor;
  final Color borderColor;
  final double borderWidth;
  final BorderRadius borderRadius;
  final EdgeInsetsGeometry padding;
  final List<BoxShadow> shadow;
  final bool dotGrid;
  final Color? accentColor;
  final DsCorner accentPosition;
  final double accentSize;

  @override
  Widget build(BuildContext context) {
    final p = accentPosition;
    final left = p == DsCorner.topLeft || p == DsCorner.bottomLeft;
    final top = p == DsCorner.topLeft || p == DsCorner.topRight;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border.all(color: borderColor, width: borderWidth),
        borderRadius: borderRadius,
        boxShadow: shadow,
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: Stack(
          children: [
            if (dotGrid) const Positioned.fill(child: IgnorePointer(child: DsDotGrid())),
            Padding(padding: padding, child: child),
            if (accentColor != null)
              Positioned(
                left: left ? 0 : null,
                right: left ? null : 0,
                top: top ? 0 : null,
                bottom: top ? null : 0,
                child: IgnorePointer(
                  child: DsCornerAccent(color: accentColor!, position: p, size: accentSize),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class DsCard extends StatelessWidget {
  const DsCard({
    required this.child,
    super.key,
    this.accentColor,
    this.showDotGrid = false,
    this.hasShadow = false,
    this.padding = const EdgeInsets.all(DsSpacing.space16),
    this.borderColor = DsColor.surfaceBorder,
    this.backgroundColor = DsColor.surface,
  });

  final Widget child;
  final Color? accentColor;
  final bool showDotGrid;
  final bool hasShadow;
  final EdgeInsetsGeometry padding;
  final Color borderColor;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) => DsSurface(
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    padding: padding,
    shadow: hasShadow ? DsShadow.small : DsShadow.none,
    dotGrid: showDotGrid,
    accentColor: accentColor,
    child: child,
  );
}

class DsCornerAccent extends StatelessWidget {
  const DsCornerAccent({required this.color, required this.position, required this.size, super.key});

  final Color color;
  final DsCorner position;
  final double size;

  @override
  Widget build(BuildContext context) => CustomPaint(size: Size.square(size), painter: _CornerPainter(color, position));
}

class _CornerPainter extends CustomPainter {
  const _CornerPainter(this.color, this.position);

  final Color color;
  final DsCorner position;

  @override
  void paint(Canvas canvas, Size s) {
    final path = switch (position) {
      DsCorner.topLeft =>
        Path()
          ..moveTo(0, 0)
          ..lineTo(s.width, 0)
          ..lineTo(0, s.height),
      DsCorner.topRight =>
        Path()
          ..moveTo(0, 0)
          ..lineTo(s.width, 0)
          ..lineTo(s.width, s.height),
      DsCorner.bottomLeft =>
        Path()
          ..moveTo(0, 0)
          ..lineTo(0, s.height)
          ..lineTo(s.width, s.height),
      DsCorner.bottomRight =>
        Path()
          ..moveTo(s.width, 0)
          ..lineTo(s.width, s.height)
          ..lineTo(0, s.height),
    };
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_CornerPainter old) => old.color != color || old.position != position;
}

/// カードの背景の点描。列ごとに半ピッチずらす。
class DsDotGrid extends StatelessWidget {
  const DsDotGrid({super.key, this.color = DsColor.contentPrimary, this.opacity = 0.08, this.spacing = 6});

  final Color color;
  final double opacity;
  final double spacing;

  @override
  Widget build(BuildContext context) => CustomPaint(
    painter: _DotPainter(color.withValues(alpha: opacity), spacing),
    child: const SizedBox.expand(),
  );
}

class _DotPainter extends CustomPainter {
  const _DotPainter(this.color, this.spacing);

  final Color color;
  final double spacing;

  @override
  void paint(Canvas canvas, Size size) {
    const inset = 8.0;
    final p = Paint()..color = color;
    var col = 0;
    for (var x = inset; x <= size.width - inset; x += spacing, col++) {
      final dy = col.isOdd ? spacing / 2 : 0;
      for (var y = inset + dy; y <= size.height - inset; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1, p);
      }
    }
  }

  @override
  bool shouldRepaint(_DotPainter old) => old.color != color || old.spacing != spacing;
}

// ───────────────────────── 文字 ─────────────────────────

/// Oxanium の数値。characterColors で桁ごとに色を変える。
class DsDisplayNumber extends StatelessWidget {
  const DsDisplayNumber(this.value, {super.key, this.color = DsColor.contentPrimary, this.fontSize = 32, this.characterColors, this.textAlign});

  final String value;
  final Color color;
  final double fontSize;
  final List<Color>? characterColors;
  final TextAlign? textAlign;

  @override
  Widget build(BuildContext context) {
    final style = DsTypography.displayNumeric.copyWith(color: color, fontSize: fontSize);
    final colors = characterColors;
    if (colors == null || colors.isEmpty) return Text(value, style: style, textAlign: textAlign);
    return Text.rich(
      TextSpan(
        style: style,
        children: [
          for (var i = 0; i < value.length; i++)
            TextSpan(
              text: value[i],
              style: TextStyle(color: colors[i % colors.length]),
            ),
        ],
      ),
      textAlign: textAlign,
    );
  }
}

/// 打率の形の数値を、製品のホームと同じく「.」と 1 桁目を cyan、2 桁目を白、3 桁目を pink で塗る。
List<Color> averageColors(String v) => v.length == 4 ? const [DsColor.actionPrimary, DsColor.actionPrimary, DsColor.contentPrimary, DsColor.actionEmphasis] : const [DsColor.actionPrimary];

/// 数値の上に小さなラベルを添える統計の 1 セル。DESIGN.md 10.3 の標準実装。
class DsStat extends StatelessWidget {
  const DsStat({required this.label, required this.value, super.key, this.color = DsColor.contentPrimary, this.size = 24, this.colors, this.align = CrossAxisAlignment.center});

  final String label;
  final String value;
  final Color color;
  final double size;
  final List<Color>? colors;
  final CrossAxisAlignment align;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: align,
    mainAxisSize: MainAxisSize.min,
    children: [
      Text(label, style: DsTypography.overline.copyWith(color: DsColor.contentSecondary, letterSpacing: 0)),
      const SizedBox(height: DsSpacing.space4),
      DsDisplayNumber(value, fontSize: size, color: color, characterColors: colors),
    ],
  );
}

// ───────────────────────── 札と点 ─────────────────────────

enum DsBadgeShape { rounded, chamfered }

class DsBadge extends StatelessWidget {
  const DsBadge({required this.label, required this.color, super.key, this.foreground = DsColor.onAction, this.shape = DsBadgeShape.rounded, this.large = false});

  final String label;
  final Color color;
  final Color foreground;
  final DsBadgeShape shape;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final chamfered = shape == DsBadgeShape.chamfered;
    final box = DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: chamfered ? BorderRadius.zero : DsRadius.borderXs,
        border: Border.all(color: DsColor.onAction),
        boxShadow: chamfered ? null : DsShadow.xs,
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: large ? DsSpacing.space12 : DsSpacing.space8, vertical: DsSpacing.space4),
        child: Text(
          label,
          style: (large ? DsTypography.body2 : DsTypography.overline).copyWith(color: foreground, fontWeight: FontWeight.w700, letterSpacing: 0.4),
        ),
      ),
    );
    if (!chamfered) return box;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned.fill(
          child: Transform.translate(
            offset: const Offset(0, 2),
            child: const ClipPath(
              clipper: _Chamfer(),
              child: ColoredBox(color: DsColor.shadow),
            ),
          ),
        ),
        ClipPath(clipper: const _Chamfer(), child: box),
      ],
    );
  }
}

class _Chamfer extends CustomClipper<Path> {
  const _Chamfer();

  @override
  Path getClip(Size s) {
    const c = 3.0;
    return Path()
      ..moveTo(c, 0)
      ..lineTo(s.width - c, 0)
      ..lineTo(s.width, c)
      ..lineTo(s.width, s.height - c)
      ..lineTo(s.width - c, s.height)
      ..lineTo(c, s.height)
      ..lineTo(0, s.height - c)
      ..lineTo(0, c)
      ..close();
  }

  @override
  bool shouldReclip(_Chamfer old) => false;
}

class DsStatusDot extends StatelessWidget {
  const DsStatusDot({required this.color, super.key, this.size = DsSpacing.space8, this.outlined = false});

  final Color color;
  final double size;
  final bool outlined;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      color: outlined ? DsColor.surface : color,
      border: outlined ? Border.all(color: color, width: DsBorder.standard) : null,
    ),
  );
}

// ───────────────────────── ボタン ─────────────────────────

enum DsButtonType {
  primary(DsColor.actionPrimary, DsColor.onAction, DsColor.onAction),
  secondary(DsColor.contentPrimary, DsColor.onAction, DsColor.onAction),
  outline(DsColor.surface, DsColor.surfaceBorder, DsColor.contentPrimary),
  danger(DsColor.incorrect, DsColor.onAction, DsColor.onAction),
  text(Colors.transparent, null, DsColor.actionEmphasis);

  const DsButtonType(this.background, this.border, this.foreground);

  final Color background;
  final Color? border;
  final Color foreground;
}

/// 押すと 100ms で 0.95 倍に縮み、離すと戻ってから動く。リップルは無い。
class DsButton extends StatefulWidget {
  const DsButton({required this.label, required this.onPressed, super.key, this.type = DsButtonType.primary, this.icon, this.small = false, this.tight = false, this.color, this.foreground});

  final String label;
  final VoidCallback? onPressed;
  final DsButtonType type;
  final DsGlyph? icon;
  final bool small;

  /// 試作で足した、高さ 48 のまま左右の余白と文字を詰める形。下端の帯の補助のボタンに使い、回答のボタンと高さを揃える。
  final bool tight;

  /// 試作で足した上書き。主の色を状況の色（ランクなど）に替えるときに使う。
  final Color? color;
  final Color? foreground;

  @override
  State<DsButton> createState() => _DsButtonState();
}

class _DsButtonState extends State<DsButton> with SingleTickerProviderStateMixin {
  late final _press = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));

  @override
  void dispose() {
    _press.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    final t = widget.type;
    final bg = enabled ? (widget.color ?? t.background) : DsColor.disabledSurface;
    final fg = enabled ? (widget.foreground ?? t.foreground) : DsColor.disabledContent;
    final isText = t == DsButtonType.text;
    final label = Text(
      widget.label,
      maxLines: 1,
      style: DsTypography.button.copyWith(color: fg, fontSize: widget.small || widget.tight ? 14 : 16),
    );
    final icon = widget.icon == null ? null : DsIcon(widget.icon!, size: 20, color: fg, background: bg);
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      excludeSemantics: true,
      onTap: widget.onPressed,
      child: GestureDetector(
        onTapDown: enabled ? (_) => _press.animateTo(1) : null,
        onTapCancel: () => _press.reset(),
        onTapUp: enabled ? (_) => _press.animateTo(1).whenComplete(() => _press.animateTo(0).whenCompleteOrCancel(() => widget.onPressed?.call())) : null,
        child: AnimatedBuilder(
          animation: _press,
          builder: (context, child) => Transform.scale(scale: 1 - Curves.easeInOutBack.transform(_press.value) * 0.05, child: child),
          child: SizedBox(
            height: isText ? 32 : (widget.small ? 36 : 48),
            child: DecoratedBox(
              decoration: isText
                  ? const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: DsColor.actionEmphasis, width: DsBorder.standard),
                      ),
                    )
                  : BoxDecoration(
                      color: bg,
                      borderRadius: DsRadius.borderSm,
                      border: enabled && t.border != null ? Border.all(color: t.border!, width: DsBorder.standard) : null,
                      boxShadow: enabled ? DsShadow.small : null,
                    ),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: isText ? 0 : (widget.tight ? 8 : (widget.small ? 16 : 24))),
                child: Row(
                  mainAxisSize: isText ? MainAxisSize.min : MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[icon, const SizedBox(width: DsSpacing.space8)],
                    Flexible(
                      child: FittedBox(fit: BoxFit.scaleDown, child: label),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// ヘッダーの透明なアイコンボタン。枠も塗りも持たず、44pt の領域を持つ。
class DsHeaderIconButton extends StatelessWidget {
  const DsHeaderIconButton({required this.icon, required this.tooltip, required this.onPressed, super.key});

  final DsGlyph icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => IconButton(
    onPressed: onPressed,
    tooltip: tooltip,
    constraints: const BoxConstraints.tightFor(width: 44, height: 44),
    icon: DsIcon(icon, background: DsColor.background),
  );
}

// ───────────────────────── 端の帯 ─────────────────────────

/// 画面上端のフラットなヘッダー。高さ 48、題は中央に固定し、下辺の 1px と短いアクセントで区切る。
class DsPageHeader extends StatelessWidget {
  const DsPageHeader({required this.title, super.key, this.leading, this.trailing, this.accentColor = DsColor.actionPrimary, this.bottom});

  final String title;
  final Widget? leading;
  final Widget? trailing;
  final Color accentColor;

  /// 試作で足した、題の下に置く細い帯（タイマーの進みなど）。
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: DsColor.background,
        border: Border(bottom: BorderSide(color: DsColor.disabledSurface)),
      ),
      child: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            SizedBox(
              height: 48,
              child: Row(
                children: [
                  SizedBox(
                    width: 100,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Padding(padding: const EdgeInsets.only(left: 4), child: leading),
                    ),
                  ),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                        ),
                        ?bottom,
                      ],
                    ),
                  ),
                  SizedBox(
                    width: 100,
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Padding(padding: const EdgeInsets.only(right: 4), child: trailing),
                    ),
                  ),
                ],
              ),
            ),
            Positioned(bottom: 0, left: 0, child: Container(width: 40, height: 2, color: accentColor)),
          ],
        ),
      ),
    );
  }
}

/// 画面下端の主要な操作の帯。上辺の 1px で区切り、左右 20、上下 8 の余白と下の安全域を持つ。
class DsBottomActionBar extends StatelessWidget {
  const DsBottomActionBar({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: const BoxDecoration(
      color: DsColor.background,
      border: Border(top: BorderSide(color: DsColor.disabledSurface)),
    ),
    child: SafeArea(
      top: false,
      child: Padding(padding: const EdgeInsets.fromLTRB(20, 8, 20, 8), child: child),
    ),
  );
}

// ───────────────────────── ブランド ─────────────────────────

/// .389 のロゴ。製品の assets/in_app/svg/logo_389.svg のパスをそのまま描く。
class Logo389 extends StatelessWidget {
  const Logo389({super.key, this.width = 220});

  final double width;

  @override
  Widget build(BuildContext context) => Semantics(
    label: '.389',
    child: SizedBox(
      width: width,
      height: width * 146 / 372,
      child: const CustomPaint(painter: _LogoPainter()),
    ),
  );
}

class _LogoPainter extends CustomPainter {
  const _LogoPainter();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 372);
    final parts = [
      (Path()..addRRect(RRect.fromLTRBR(7, 105, 37, 135, const Radius.circular(2))), const Color(0xFF29BFC6)),
      (_svgPath(_three), const Color(0xFF29BFC6)),
      (_svgPath(_eight)..fillType = PathFillType.evenOdd, const Color(0xFFEEEDF0)),
      (_svgPath(_nine)..fillType = PathFillType.evenOdd, const Color(0xFFE86186)),
    ];
    final shade = Paint()..color = const Color(0xFF171D22).withValues(alpha: 0.9);
    for (final (path, _) in parts) {
      canvas.drawPath(path.shift(const Offset(5, 6)), shade);
    }
    for (final (path, color) in parts) {
      canvas.drawPath(path, Paint()..color = color);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// SVG の絶対座標の M、L、Q、Z だけを読む。ロゴのパスはこの 4 つで書かれている。
Path _svgPath(String d) {
  final path = Path();
  final tokens = RegExp(r'[MLQZ]|-?[\d.]+').allMatches(d).map((m) => m.group(0)!).toList();
  var i = 0;
  double n() => double.parse(tokens[i++]);
  while (i < tokens.length) {
    switch (tokens[i++]) {
      case 'M':
        path.moveTo(n(), n());
      case 'L':
        path.lineTo(n(), n());
      case 'Q':
        path.quadraticBezierTo(n(), n(), n(), n());
      case 'Z':
        path.close();
    }
  }
  return path;
}

const _three =
    'M 74.538 6.365 L 62.462 17.635 Q 61 19 61 21 L 61 38 Q 61 40 63 40 L 85 40 Q 87 40 87 38 L 87 35.188 Q 87 34 87.84 33.16 L 88.16 32.84 Q 89 32 90.188 32 L 116.812 32 Q 118 32 118.84 32.84 L 119.16 33.16 Q 120 34 120 35.188 L 120 53.218 Q 120 55 118.74 56.26 L 118.26 56.74 Q 117 58 115.218 58 L 92 58 Q 90 58 89.451 59.923 L 88.549 63.077 Q 88 65 88 67 L 88 81.812 Q 88 83 88.84 83.84 L 89.16 84.16 Q 90 85 91.188 85 L 116.812 85 Q 118 85 118.84 85.84 L 119.16 86.16 Q 120 87 120 88.188 L 120 106.218 Q 120 108 118.74 109.26 L 118.26 109.74 Q 117 111 115.218 111 L 90.188 111 Q 89 111 88.16 110.16 L 87.84 109.84 Q 87 109 86.832 107.824 L 86.283 103.98 Q 86 102 84 102 L 64 102 Q 62 102 61.9 103.998 L 61.1 120.002 Q 61 122 62.414 123.414 L 74.586 135.586 Q 76 137 78 137 L 130 137 Q 132 137 133.414 135.586 L 145.586 123.414 Q 147 122 147 120 L 147 83 Q 147 81 145.586 79.586 L 139.891 73.891 Q 139 73 139 71.74 L 139 71.26 Q 139 70 139.837 69.058 L 145.671 62.495 Q 147 61 147 59 L 147 22 Q 147 20 145.586 18.586 L 133.414 6.414 Q 132 5 130 5 L 78 5 Q 76 5 74.538 6.365 Z';
const _eight =
    'M 182.538 6.365 L 170.462 17.635 Q 169 19 169 21 L 169 60 Q 169 62 170.414 63.414 L 176.406 69.406 Q 177 70 177 70.84 L 177 71.16 Q 177 72 176.406 72.594 L 170.414 78.586 Q 169 80 169 82 L 169 121 Q 169 123 170.414 124.414 L 181.586 135.586 Q 183 137 185 137 L 238 137 Q 240 137 241.414 135.586 L 253.586 123.414 Q 255 122 255 120 L 255 82 Q 255 80 253.586 78.586 L 247.594 72.594 Q 247 72 247 71.16 L 247 70.84 Q 247 70 247.594 69.406 L 253.586 63.414 Q 255 62 255 60 L 255 22 Q 255 20 253.586 18.586 L 241.414 6.414 Q 240 5 238 5 L 186 5 Q 184 5 182.538 6.365 Z M 197.26 85.16 L 197.74 84.84 Q 199 84 200.514 84 L 223.218 84 Q 225 84 226.26 85.26 L 226.74 85.74 Q 228 87 228 88.782 L 228 107.812 Q 228 109 227.16 109.84 L 226.84 110.16 Q 226 111 224.812 111 L 199.782 111 Q 198 111 196.74 109.74 L 196.26 109.26 Q 195 108 195.081 106.22 L 195.931 87.513 Q 196 86 197.26 85.16 Z M 196.414 33.586 L 197.586 32.414 Q 199 31 201 31 L 223.218 31 Q 225 31 226.26 32.26 L 226.74 32.74 Q 228 34 228 35.782 L 228 54.812 Q 228 56 227.16 56.84 L 226.84 57.16 Q 226 58 224.812 58 L 199.782 58 Q 198 58 196.74 56.74 L 196.26 56.26 Q 195 55 195 53.218 L 195 37 Q 195 35 196.414 33.586 Z';
const _nine =
    'M 290.586 6.414 L 278.414 18.586 Q 277 20 277 22 L 277 68 Q 277 70 278.459 71.368 L 291.541 83.632 Q 293 85 295 85 L 332.812 85 Q 334 85 334.84 85.84 L 335.16 86.16 Q 336 87 336 88.188 L 336 106.486 Q 336 108 335.16 109.26 L 334.84 109.74 Q 334 111 332.486 111 L 307.188 111 Q 306 111 305.16 110.16 L 304.84 109.84 Q 304 109 303.832 107.824 L 303.283 103.98 Q 303 102 301 102 L 280.188 102 Q 279 102 278.16 102.84 L 277.84 103.16 Q 277 104 277 105.188 L 277 120 Q 277 122 278.414 123.414 L 290.586 135.586 Q 292 137 294 137 L 347 137 Q 349 137 350.414 135.586 L 361.586 124.414 Q 363 123 363 121 L 363 21 Q 363 19 361.586 17.586 L 350.414 6.414 Q 349 5 347 5 L 294 5 Q 292 5 290.586 6.414 Z M 304.84 33.16 L 305.16 32.84 Q 306 32 307.188 32 L 332.812 32 Q 334 32 334.84 32.84 L 335.16 33.16 Q 336 34 336 35.188 L 336 54.812 Q 336 56 335.16 56.84 L 334.84 57.16 Q 334 58 332.812 58 L 307.188 58 Q 306 58 305.16 57.16 L 304.84 56.84 Q 304 56 304 54.812 L 304 35.188 Q 304 34 304.84 33.16 Z';

/// ホームの背景に成績値を流す。製品の StatsStreamBackground（60 秒で 1 周、8 列、先頭 0.22 から末尾 0.05 へ薄れる）を写す。
class StatsStreamBackground extends StatefulWidget {
  const StatsStreamBackground({super.key});

  @override
  State<StatsStreamBackground> createState() => _StatsStreamState();
}

class _StatsStreamState extends State<StatsStreamBackground> with SingleTickerProviderStateMixin {
  late final _t = AnimationController(vsync: this, duration: const Duration(seconds: 60));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (dsStill(context)) {
      _t.stop();
    } else if (!_t.isAnimating) {
      _t.repeat();
    }
  }

  @override
  void dispose() {
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: IgnorePointer(
      child: RepaintBoundary(
        child: ShaderMask(
          blendMode: BlendMode.dstIn,
          shaderCallback: (r) => const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.transparent, Colors.white, Colors.white, Colors.transparent],
            stops: [0, 0.12, 0.88, 1],
          ).createShader(r),
          child: CustomPaint(painter: _StreamPainter(_t), child: const SizedBox.expand()),
        ),
      ),
    ),
  );
}

const _streamValues = ['.389', '55', '134', '1.023', '.318', '63', '.402', '2.41', '168', '.947', '34', '.551', '582', '.289', '24', '.856', '1.08', '31', '.347', '102'];

class _StreamPainter extends CustomPainter {
  _StreamPainter(this.t) : super(repaint: t);

  final Animation<double> t;

  @override
  void paint(Canvas canvas, Size size) {
    final random = math.Random(894);
    const columns = 8;
    const row = 24.0;
    final step = size.width / columns;
    var vi = random.nextInt(_streamValues.length);
    for (var c = 0; c < columns; c++) {
      final head = switch (c % 3) {
        0 => DsColor.actionPrimary,
        1 => DsColor.actionEmphasis,
        _ => DsColor.contentSecondary,
      };
      final laps = 2 + random.nextInt(3);
      final x = step * (c + 0.5 + (random.nextDouble() - 0.5) * 0.6);
      for (var d = 0; d < 2; d++) {
        final phase = (d / 2 + random.nextDouble() / 2) % 1;
        final count = 4 + random.nextInt(4);
        final span = size.height + count * row + 160;
        final y0 = ((t.value * laps + phase) % 1) * span - count * row;
        for (var k = 0; k < count; k++) {
          final value = _streamValues[(vi + k) % _streamValues.length];
          final a = lerpDouble(0.22, 0.05, k / count)!;
          final tp = TextPainter(
            text: TextSpan(
              text: value,
              style: DsTypography.displayNumeric.copyWith(fontSize: 13, letterSpacing: 1, color: (k == 0 ? head : DsColor.contentSecondary).withValues(alpha: a)),
            ),
            textDirection: TextDirection.ltr,
          )..layout();
          tp.paint(canvas, Offset(x - tp.width / 2, y0 + (count - k) * row));
        }
        vi += count;
      }
    }
  }

  @override
  bool shouldRepaint(_StreamPainter old) => false;
}

/// ランクの色。DESIGN.md 2.3。
Color dsRankColor(String label) => switch (label) {
  'SS' => DsColor.rankSs,
  'S' => DsColor.rankS,
  'A' => DsColor.rankA,
  'B' => DsColor.rankB,
  'C' => DsColor.rankC,
  _ => DsColor.incorrect,
};
