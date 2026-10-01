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
  const QuizApp({required this.title, required this.theme, required this.screens, this.darkTheme, super.key});

  final String title;
  final ThemeData theme;
  final ThemeData? darkTheme;

  /// jumpTargets の key ごとの画面。home は必須。
  final Map<String, WidgetBuilder> screens;

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
