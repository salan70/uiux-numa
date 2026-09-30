import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'fixture.dart';
import 'parts.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// Web で確かめるための操作盤。製品の UI ではない。
// 実行基盤が端末の枠の外に置き、端末の中の UI に重ねない。
// 行き先は起動の route（README の「試し方」）と同じで、選ぶと固定データから作り直してその画面を開く。

/// 操作盤から JourneyApp への依頼。操作盤は実行基盤の側で別の木に描かれるので、同じ isolate の通知で結ぶ。
abstract final class ScreenJump {
  /// 起動し直す条件（query と同じ形）。
  static final restart = ValueNotifier<Map<String, String>?>(null);

  /// 配色。起動し直さずに今の画面へ効かせる。
  static final themeMode = ValueNotifier<ThemeMode>(ThemeMode.system);

  /// 今の起動条件。操作盤で選んでいる行き先を示す。
  static final current = ValueNotifier<LaunchOptions?>(null);
}

/// 行き先。route が null ならタイトル。
const _groups = <(String, List<(String, String?)>)>[
  ('入口', [('タイトル', null), ('選手トップ', 'play'), ('メニュー', 'menu'), ('名鑑', 'directory')]),
  ('試合', [('出場を選ぶ', 'game'), ('入力中', 'input'), ('スコア', 'score'), ('試合後', 'afterGame'), ('試合後のトップ', 'topAfterGame'), ('欠場で進める', 'skip'), ('試合を直す', 'edit')]),
  ('移籍', [('シーズン途中の移籍', 'transfer')]),
  ('節目', [('シーズンの終了', 'seasonEnd'), ('前の年の 1 ページ', 'year'), ('来季の始まり', 'nextSeason'), ('引退の直後', 'farewell')]),
  ('そのほか', [('選手を作る', 'create'), ('試合の履歴', 'history'), ('引退した選手の詳細', 'retired'), ('設定', 'settings')]),
];

const _fixtureLabels = {
  Fixture.midseason: '4 年目の途中',
  Fixture.rookie: '新人',
  Fixture.seasonEnd: '全試合の後',
  Fixture.empty: '選手なし',
  Fixture.transferred: '途中で移籍した後',
};

/// 実行基盤の操作盤。実行基盤の暗い地に合わせ、ダークの配色で描く。
class ScreenJumpPanel extends StatelessWidget {
  const ScreenJumpPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(Bold.radius),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: buildTheme(Brightness.dark),
        locale: const Locale('ja'),
        supportedLocales: const [Locale('ja')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: const _Panel(),
      ),
    );
  }
}

class _Panel extends StatefulWidget {
  const _Panel();

  @override
  State<_Panel> createState() => _PanelState();
}

class _PanelState extends State<_Panel> {
  Fixture? _fixture;
  bool? _saveFailure;

  void _go(LaunchOptions? current, String? route) {
    ScreenJump.restart.value = {
      'fixture': (_fixture ?? current?.fixture ?? Fixture.midseason).name,
      'route': ?route,
      if (_saveFailure ?? current?.saveFailure ?? false) 'saveFailure': '1',
    };
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Scaffold(
      body: ListenableBuilder(
        listenable: Listenable.merge([ScreenJump.current, ScreenJump.themeMode]),
        builder: (context, _) {
          final current = ScreenJump.current.value;
          final fixture = _fixture ?? current?.fixture ?? Fixture.midseason;
          return ListView(
            padding: const EdgeInsets.fromLTRB(Space.s400, Space.s400, Space.s400, Space.s600),
            children: [
              Semantics(header: true, child: const Text('画面へ移る', style: Txt.heading)),
              Text('選んだ画面を、固定のデータから開き直します。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
              const SectionTitle('配色'),
              ChoiceWrap<ThemeMode>(
                semanticsLabel: '配色',
                values: ThemeMode.values,
                label: (m) => switch (m) {
                  ThemeMode.system => '端末',
                  ThemeMode.light => 'ライト',
                  ThemeMode.dark => 'ダーク',
                },
                isSelected: (m) => m == ScreenJump.themeMode.value,
                onSelected: (m) => ScreenJump.themeMode.value = m,
              ),
              const SectionTitle('データ'),
              Text('次に開く画面から効きます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
              const SizedBox(height: Space.s200),
              ChoiceWrap<Fixture>(
                semanticsLabel: 'データ',
                values: _fixtureLabels.keys.toList(),
                label: (f) => _fixtureLabels[f]!,
                isSelected: (f) => f == fixture,
                onSelected: (f) => setState(() => _fixture = f),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('次の保存を 1 回失敗させる'),
                value: _saveFailure ?? current?.saveFailure ?? false,
                onChanged: (v) => setState(() => _saveFailure = v),
              ),
              for (final (title, items) in _groups) ...[
                SectionTitle(title),
                LayoutBuilder(
                  builder: (context, c) {
                    final width = (c.maxWidth - Space.s200) / 2;
                    return Wrap(
                      spacing: Space.s200,
                      runSpacing: Space.s200,
                      children: [
                        for (final (label, route) in items)
                          SizedBox(
                            width: width,
                            child: KeyButton(
                              label: label,
                              oneLine: true,
                              height: Sizes.controlMd,
                              fill: current != null && route == current.route ? p.secondaryContainer : null,
                              onPressed: () => _go(current, route),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
