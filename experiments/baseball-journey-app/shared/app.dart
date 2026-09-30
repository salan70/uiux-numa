import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'screen_jump.dart';
import 'store.dart';
import 'theme.dart';

/// 3 案が共有する殻。StoreScope を MaterialApp の上に置き、シートとダイアログからも同じ状態を引けるようにする。
class JourneyApp extends StatefulWidget {
  const JourneyApp({super.key, required this.home, this.query});

  final Widget Function(AppStore store) home;

  /// 起動条件。省くと URL の query を読む。
  final Map<String, String>? query;

  @override
  State<JourneyApp> createState() => _JourneyAppState();
}

class _JourneyAppState extends State<JourneyApp> {
  late final Map<String, String> _launch = widget.query ?? Uri.base.queryParameters;
  late AppStore _store = AppStore(LaunchOptions(_launch));
  final _navigator = GlobalKey<NavigatorState>();

  /// 起動し直した回数。MaterialApp の key にし、画面の積み重ねを捨てて最初から開く。
  int _generation = 0;

  /// 撮影（bare）では画面の移動のボタンを描かない。
  bool get _showJump => kIsWeb && _launch['bare'] != '1';

  /// 画面の移動。起動条件を差し替えて、固定データと起動直後の route から作り直す。配色の設定は引き継ぐ。
  void _restart(Map<String, String> query) {
    final old = _store;
    setState(() {
      _store = AppStore(LaunchOptions(query))..themeMode = old.themeMode;
      _generation++;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => old.dispose());
  }

  @override
  void dispose() {
    _store.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StoreScope(
      store: _store,
      child: ListenableBuilder(
        listenable: _store,
        builder: (context, _) => MaterialApp(
          key: ValueKey(_generation),
          navigatorKey: _navigator,
          debugShowCheckedModeBanner: false,
          title: 'Baseball Player Journey',
          theme: buildTheme(Brightness.light),
          darkTheme: buildTheme(Brightness.dark),
          themeMode: _store.themeMode,
          locale: const Locale('ja'),
          supportedLocales: const [Locale('ja')],
          localizationsDelegates: GlobalMaterialLocalizations.delegates,
          // 端末の試作なので、Web で見るときもマウスのドラッグで指と同じようにスクロールさせる。
          scrollBehavior: const MaterialScrollBehavior().copyWith(dragDevices: PointerDeviceKind.values.toSet()),
          builder: _showJump
              ? (context, child) => Stack(
                  children: [
                    child!,
                    ScreenJumpButton(
                      current: _store.options,
                      navigator: _navigator,
                      onJump: _restart,
                    ),
                  ],
                )
              : null,
          home: widget.home(_store),
        ),
      ),
    );
  }
}
