import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

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
  late final AppStore _store = AppStore(LaunchOptions(widget.query ?? Uri.base.queryParameters));

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
          home: widget.home(_store),
        ),
      ),
    );
  }
}
