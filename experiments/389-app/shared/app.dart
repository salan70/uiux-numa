import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'data.dart';
import 'profile.dart';

// 3 案が共有する殻。配色と画面は案が渡し、殻は記録、画面へ移る仕組み、Web で確かめるための設定だけを持つ。
// 起動の query: screen=<行き先>（下の jumpTargets）、user=new、daily=done、player=<名前>。

/// 画面へ移る行き先。案はこの key ごとに画面を用意する。
const jumpTargets = <(String, String)>[
  ('home', 'ホーム'),
  ('quiz', 'クイズ（開始）'),
  ('quizMid', 'クイズ（途中）'),
  ('answer', '答えを入れる'),
  ('wrong', '外れた直後'),
  ('result', '正解の結果'),
  ('daily', '今日の1問'),
  ('dailyFail', '今日の1問（3 回外れ）'),
  ('stats', 'マイ成績'),
];

/// 操作盤から殻への依頼。操作盤は実行基盤の側で別の木に描かれるので、同じ isolate の通知で結ぶ。
final jumpRequest = ValueNotifier<String?>(null);

/// 狭い画面のシートから VariantHost への、案を替える依頼。
final variantRequest = ValueNotifier<String?>(null);

const variantLabels = <(String, String)>[('scoreboard', '現行を磨く'), ('atbat', '打席に読み替える'), ('collection', '名鑑を埋める')];

/// 確かめるための出題。player の query で選手を変えられる。既定は年度が多く、項目の変化が読みやすい選手にした。
QuizSession sampleSession({int reveal = 0, QuizMode mode = QuizMode.normal}) {
  final name = Uri.base.queryParameters['player'] ?? '柳田 悠岐';
  final player = quizPlayers.where((p) => p.name == name).firstOrNull ?? quizPlayers.first;
  final session = QuizSession(player: player, mode: mode, seed: 389);
  for (var i = 0; i < reveal; i++) {
    session.revealNext();
  }
  return session;
}

/// 案が使う記録。起動ごとに 1 つ。
final profile = Profile.fromQuery();

class QuizApp extends StatefulWidget {
  const QuizApp({required this.title, required this.theme, required this.screens, this.darkTheme, this.variant, super.key});

  final String title;
  final ThemeData theme;
  final ThemeData? darkTheme;

  /// jumpTargets の key ごとの画面。home は必須。
  final Map<String, WidgetBuilder> screens;

  /// 狭い画面のシートで、いまの案として示す id。
  final String? variant;

  @override
  State<QuizApp> createState() => _QuizAppState();
}

class _QuizAppState extends State<QuizApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    jumpRequest.addListener(_jump);
  }

  @override
  void dispose() {
    jumpRequest.removeListener(_jump);
    super.dispose();
  }

  void _jump() {
    final target = jumpRequest.value;
    final builder = widget.screens[target];
    final nav = _navigatorKey.currentState;
    if (builder == null || nav == null) return;
    nav.popUntil((r) => r.isFirst);
    if (target != 'home') nav.push(PageRouteBuilder<void>(pageBuilder: (c, _, _) => builder(c)));
    jumpRequest.value = null;
  }

  @override
  Widget build(BuildContext context) {
    final start = Uri.base.queryParameters['screen'];
    return MaterialApp(
      navigatorKey: _navigatorKey,
      // 窓が端末の枠と操作盤を並べられないほど狭い（スマホで開いた）ときは、案と画面を選ぶボタンを重ねる。撮影（bare=1）では出さない。
      builder: (context, child) {
        final window = MediaQueryData.fromView(View.of(context)).size.width;
        final compact = window < 402 + 32 + 320 + 80 && Uri.base.queryParameters['bare'] != '1';
        if (!compact || child == null) return child ?? const SizedBox.shrink();
        return Stack(children: [child, _JumpButton(navigatorKey: _navigatorKey, variant: widget.variant)]);
      },
      debugShowCheckedModeBanner: false,
      title: widget.title,
      theme: widget.theme,
      darkTheme: widget.darkTheme ?? widget.theme,
      locale: const Locale('ja'),
      supportedLocales: const [Locale('ja')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      // 端末の試作なので、Web で見るときもマウスのドラッグで指と同じようにスクロールさせる。
      scrollBehavior: const MaterialScrollBehavior().copyWith(dragDevices: PointerDeviceKind.values.toSet()),
      home: Builder(builder: widget.screens[start] ?? widget.screens['home']!),
    );
  }
}

/// 実行基盤の操作盤。製品の UI ではない。
class JumpPanel extends StatelessWidget {
  const JumpPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(brightness: Brightness.dark, colorSchemeSeed: const Color(0xFF8A8F98)),
      home: Scaffold(
        backgroundColor: const Color(0xFF1B1D21),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('画面へ移る', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            for (final (key, label) in jumpTargets)
              ListTile(dense: true, title: Text(label), onTap: () => jumpRequest.value = key),
          ],
        ),
      ),
    );
  }
}

/// 狭い画面で重ねる丸いボタン。右端の下から 3 割の高さに置き、下端の操作とヘッダーに重ねない。縦にドラッグして動かせる。
class _JumpButton extends StatefulWidget {
  const _JumpButton({required this.navigatorKey, required this.variant});

  final GlobalKey<NavigatorState> navigatorKey;
  final String? variant;

  @override
  State<_JumpButton> createState() => _JumpButtonState();
}

class _JumpButtonState extends State<_JumpButton> {
  double? _top;

  void _open() {
    final context = widget.navigatorKey.currentContext;
    if (context == null) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: const Color(0xFF0E1624),
      builder: (sheet) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.8,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          children: [
            const Text('案を替える', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final (id, label) in variantLabels)
                  ChoiceChip(
                    label: Text('$id・$label'),
                    selected: id == widget.variant,
                    onSelected: (_) {
                      Navigator.pop(sheet);
                      variantRequest.value = id;
                    },
                  ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('画面へ移る', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('選んだ画面を、見本のデータから開き直します。', style: TextStyle(color: Color(0xFFB8C2D1), fontSize: 12)),
            const SizedBox(height: 8),
            for (final (key, label) in jumpTargets)
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(label, style: const TextStyle(color: Colors.white)),
                trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF11C5CF)),
                onTap: () {
                  Navigator.pop(sheet);
                  jumpRequest.value = key;
                },
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final h = MediaQuery.sizeOf(context).height;
    final top = _top ?? h * 0.62;
    return Positioned(
      right: 6,
      top: top,
      child: GestureDetector(
        onVerticalDragUpdate: (d) => setState(() => _top = (top + d.delta.dy).clamp(80.0, h - 160)),
        child: Semantics(
          button: true,
          label: '案と画面を選ぶ',
          child: Material(
            color: const Color(0xCC152033),
            shape: const CircleBorder(side: BorderSide(color: Color(0xFFB8C2D1))),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: _open,
              child: const SizedBox(width: 40, height: 40, child: Icon(Icons.apps_rounded, color: Colors.white, size: 20)),
            ),
          ),
        ),
      ),
    );
  }
}
