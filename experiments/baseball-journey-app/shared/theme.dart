import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

// token と配色の読み替え。値の正本は tokens/ と experiments/color-schemes-material/variants/pop-toy/scheme.css にあり、
// ここでは Flutter の型へ写すだけにする。1rem = 16 論理ピクセル。
// 製品の方針（ui_ux_concepts.md の P-001〜P-003）の「太い輪郭とずらした影」は、押せる面にだけ残す。

/// tokens/space。
abstract final class Space {
  static const s50 = 2.0;
  static const s100 = 4.0;
  static const s150 = 6.0;
  static const s200 = 8.0;
  static const s300 = 12.0;
  static const s400 = 16.0;
  static const s500 = 20.0;
  static const s600 = 24.0;
  static const s1000 = 40.0;

  /// 画面の左右。402 幅で表の列を確保するため、page-inline（24）でなく space-400 にした。
  static const page = s400;
}

/// tokens/radius。
abstract final class Radii {
  static const control = 6.0;
  static const surface = 10.0;
  static const pill = 999.0;
}

/// tokens/border。輪郭は thick（2px）だけを使う。
abstract final class Borders {
  static const thin = 1.0;
  static const thick = 2.0;

  /// 押せる面の影のずれ。token に無い。製品の shadowSmall〜Medium（2〜4px）の間を取った。
  static const shadowOffset = 3.0;
}

/// tokens/size。押せる領域の最小は target-min（24px）でなく、製品の 48dp にする。
abstract final class Sizes {
  static const controlSm = 32.0;
  static const controlMd = 40.0;
  static const controlLg = 48.0;
  static const target = 48.0;
}

/// tokens/motion。
abstract final class Motion {
  static const state = Duration(milliseconds: 120);
  static const press = Duration(milliseconds: 160);
  static const entrance = Duration(milliseconds: 900);
  static const stagger = Duration(milliseconds: 80);
  static const standard = Cubic(0.25, 0.1, 0.25, 1);
  static const out = Cubic(0, 0, 0.58, 1);
  static const entranceCurve = Cubic(0.22, 1, 0.36, 1);

  static bool reduced(BuildContext context) => MediaQuery.disableAnimationsOf(context);
}

/// pop-toy の役割。ink と shadow は輪郭と影の色で、配色の定義に無いので on-surface から引いた。
class Palette extends ThemeExtension<Palette> {
  const Palette({
    required this.primary,
    required this.onPrimary,
    required this.primaryText,
    required this.primaryContainer,
    required this.secondary,
    required this.secondaryContainer,
    required this.onSecondaryContainer,
    required this.tertiary,
    required this.tertiaryContainer,
    required this.onTertiaryContainer,
    required this.background,
    required this.surface,
    required this.onSurface,
    required this.surfaceContainer,
    required this.surfaceVariant,
    required this.onSurfaceVariant,
    required this.outline,
    required this.focus,
    required this.success,
    required this.warning,
    required this.error,
    required this.ink,
    required this.shadow,
  });

  static const light = Palette(
    primary: Color(0xFFFAC400),
    onPrimary: Color(0xFF120D09),
    primaryText: Color(0xFF785F02),
    primaryContainer: Color(0xFFFAF1D1),
    secondary: Color(0xFF4078E0),
    secondaryContainer: Color(0xFFD4E0F7),
    onSecondaryContainer: Color(0xFF120D09),
    tertiary: Color(0xFFF37252),
    tertiaryContainer: Color(0xFFFAD9D1),
    onTertiaryContainer: Color(0xFF120D09),
    background: Color(0xFFF8F9F9),
    surface: Color(0xFFFEFEFE),
    onSurface: Color(0xFF1F1F1F),
    surfaceContainer: Color(0xFFEFF0F0),
    surfaceVariant: Color(0xFFDEE3E0),
    onSurfaceVariant: Color(0xFF4D4D4D),
    outline: Color(0xFF757575),
    focus: Color(0xFF9B7A03),
    success: Color(0xFF2E731D),
    warning: Color(0xFF795D1C),
    error: Color(0xFFA23B1B),
    ink: Color(0xFF1F1F1F),
    shadow: Color(0xFF1F1F1F),
  );

  static const dark = Palette(
    primary: Color(0xFFFAC400),
    onPrimary: Color(0xFF120D09),
    primaryText: Color(0xFFFDE591),
    primaryContainer: Color(0xFF896F10),
    secondary: Color(0xFF4078E0),
    secondaryContainer: Color(0xFF183D81),
    onSecondaryContainer: Color(0xFFFFFDF9),
    tertiary: Color(0xFFF37252),
    tertiaryContainer: Color(0xFF892810),
    onTertiaryContainer: Color(0xFFFFFDF9),
    background: Color(0xFF1A1B1B),
    surface: Color(0xFF252726),
    onSurface: Color(0xFFF0F0F0),
    surfaceContainer: Color(0xFF323433),
    surfaceVariant: Color(0xFF3E4C43),
    onSurfaceVariant: Color(0xFFC9C9C9),
    outline: Color(0xFF8B9C91),
    focus: Color(0xFFFCDF73),
    success: Color(0xFF5FDB3F),
    warning: Color(0xFFE5B23D),
    error: Color(0xFFF7A289),
    // ダークでは明るい輪郭に黒い影を合わせる。影を明るくすると面が浮かず、光って見える。
    ink: Color(0xFFC9C9C9),
    shadow: Color(0xFF000000),
  );

  final Color primary;
  final Color onPrimary;
  final Color primaryText;
  final Color primaryContainer;
  final Color secondary;
  final Color secondaryContainer;
  final Color onSecondaryContainer;
  final Color tertiary;
  final Color tertiaryContainer;
  final Color onTertiaryContainer;
  final Color background;
  final Color surface;
  final Color onSurface;
  final Color surfaceContainer;
  final Color surfaceVariant;
  final Color onSurfaceVariant;
  final Color outline;
  final Color focus;
  final Color success;
  final Color warning;
  final Color error;
  final Color ink;
  final Color shadow;

  static Palette of(BuildContext context) => Theme.of(context).extension<Palette>()!;

  @override
  Palette copyWith() => this;

  @override
  Palette lerp(Palette? other, double t) => t < 0.5 ? this : (other ?? this);
}

/// tokens/typography の 6 役割。数の見出し（display）は token に無く、不足として README に記録した。
abstract final class Txt {
  static const family = 'LINE Seed JP';
  static const _tabular = [FontFeature.tabularFigures()];

  static const title = TextStyle(fontFamily: family, fontSize: 24, fontWeight: FontWeight.w700, height: 1.3);
  static const heading = TextStyle(fontFamily: family, fontSize: 20, fontWeight: FontWeight.w700, height: 1.3);
  static const body = TextStyle(fontFamily: family, fontSize: 16, fontWeight: FontWeight.w400, height: 1.75);
  static const ui = TextStyle(fontFamily: family, fontSize: 16, fontWeight: FontWeight.w400, height: 1.5);
  static const control = TextStyle(fontFamily: family, fontSize: 16, fontWeight: FontWeight.w700, height: 1.5);
  static const caption = TextStyle(fontFamily: family, fontSize: 14, fontWeight: FontWeight.w400, height: 1.5);

  /// 成績の数。token の最大（xl 24px）では打率と本塁打の数が見出しより弱くなるため、32 を足した。
  static const figure = TextStyle(
    fontFamily: family,
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.2,
    fontFeatures: _tabular,
  );
  static const figureSm = TextStyle(
    fontFamily: family,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    height: 1.3,
    fontFeatures: _tabular,
  );
  static const tabular = TextStyle(fontFamily: family, fontFeatures: _tabular);
}

ThemeData buildTheme(Brightness brightness) {
  final p = brightness == Brightness.dark ? Palette.dark : Palette.light;
  final scheme = ColorScheme(
    brightness: brightness,
    primary: p.primary,
    onPrimary: p.onPrimary,
    primaryContainer: p.primaryContainer,
    onPrimaryContainer: p.onSurface,
    secondary: p.secondary,
    onSecondary: p.onPrimary,
    secondaryContainer: p.secondaryContainer,
    onSecondaryContainer: p.onSecondaryContainer,
    tertiary: p.tertiary,
    onTertiary: p.onPrimary,
    tertiaryContainer: p.tertiaryContainer,
    onTertiaryContainer: p.onTertiaryContainer,
    error: p.error,
    onError: p.surface,
    surface: p.surface,
    onSurface: p.onSurface,
    surfaceContainer: p.surfaceContainer,
    surfaceContainerHighest: p.surfaceVariant,
    onSurfaceVariant: p.onSurfaceVariant,
    outline: p.outline,
    outlineVariant: p.surfaceVariant,
  );
  final text = TextTheme(
    headlineSmall: Txt.title,
    titleLarge: Txt.heading,
    titleMedium: Txt.control,
    bodyLarge: Txt.body,
    bodyMedium: Txt.ui,
    bodySmall: Txt.caption,
    labelLarge: Txt.control,
    labelMedium: Txt.caption,
  ).apply(bodyColor: p.onSurface, displayColor: p.onSurface);
  final inkBorder = BorderSide(color: p.ink, width: Borders.thick);
  return ThemeData(
    brightness: brightness,
    colorScheme: scheme,
    fontFamily: Txt.family,
    textTheme: text,
    scaffoldBackgroundColor: p.background,
    extensions: [p],
    splashFactory: NoSplash.splashFactory,
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.iOS: _ReducedTransitions(CupertinoPageTransitionsBuilder()),
        TargetPlatform.android: _ReducedTransitions(FadeForwardsPageTransitionsBuilder()),
        TargetPlatform.macOS: _ReducedTransitions(CupertinoPageTransitionsBuilder()),
      },
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: p.background,
      foregroundColor: p.onSurface,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      titleTextStyle: Txt.heading.copyWith(color: p.onSurface),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: p.surface,
      indicatorColor: p.secondaryContainer,
      surfaceTintColor: Colors.transparent,
      labelTextStyle: WidgetStatePropertyAll(Txt.caption.copyWith(color: p.onSurface)),
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: p.surface,
      surfaceTintColor: Colors.transparent,
      showDragHandle: true,
      dragHandleColor: p.outline,
      shape: RoundedRectangleBorder(
        side: inkBorder,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(Radii.surface)),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: p.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(side: inkBorder, borderRadius: BorderRadius.circular(Radii.surface)),
      titleTextStyle: Txt.heading.copyWith(color: p.onSurface),
      contentTextStyle: Txt.body.copyWith(color: p.onSurface),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: p.surface,
      border: OutlineInputBorder(borderSide: inkBorder, borderRadius: BorderRadius.circular(Radii.control)),
      enabledBorder: OutlineInputBorder(borderSide: inkBorder, borderRadius: BorderRadius.circular(Radii.control)),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: p.secondary, width: 3),
        borderRadius: BorderRadius.circular(Radii.control),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: p.error, width: Borders.thick),
        borderRadius: BorderRadius.circular(Radii.control),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: Space.s300, vertical: Space.s300),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: p.secondary,
      inactiveTrackColor: p.surfaceVariant,
      thumbColor: p.secondary,
      overlayColor: p.secondary.withValues(alpha: 0.12),
    ),
    // 文字だけのボタンは primary の黄を字に使うとライトで 4.5:1 を割る。面の上の字の役割 primary-text を使う。
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: p.primaryText, textStyle: Txt.control),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: p.surface,
      selectedColor: p.secondaryContainer,
      checkmarkColor: p.onSecondaryContainer,
      labelStyle: Txt.control.copyWith(color: p.onSurface),
      side: BorderSide(color: p.outline, width: Borders.thick),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.control)),
    ),
    dividerTheme: DividerThemeData(color: p.surfaceVariant, thickness: Borders.thin, space: 1),
    tabBarTheme: TabBarThemeData(
      labelStyle: Txt.control,
      unselectedLabelStyle: Txt.control,
      labelColor: p.onSurface,
      unselectedLabelColor: p.onSurfaceVariant,
      indicatorColor: p.secondary,
      indicatorSize: TabBarIndicatorSize.tab,
      dividerColor: p.surfaceVariant,
    ),
  );
}

/// 動きの抑制では画面遷移を動かさず、すぐ切り替える（Accessibility の動きの抑制）。
class _ReducedTransitions extends PageTransitionsBuilder {
  const _ReducedTransitions(this.base);

  final PageTransitionsBuilder base;

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    if (MediaQuery.disableAnimationsOf(context)) return child;
    return base.buildTransitions(route, context, animation, secondaryAnimation, child);
  }
}

/// シートとダイアログの動き。動きの抑制では出し入れを動かさない。
AnimationStyle? sheetAnimation(BuildContext context) =>
    MediaQuery.disableAnimationsOf(context) ? AnimationStyle.noAnimation : null;
