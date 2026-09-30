import 'package:flutter/material.dart';

import 'fixture.dart';
import 'parts.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// Web で確かめるための画面の移動。製品の UI ではない。
// 端末の状態バーの位置は試作では何も描かないので、そこに小さな札を置き、UI の要素に重ねない。
// 行き先は起動の route（README の「試し方」）と同じで、選ぶと固定データから作り直してその画面を開く。

/// 行き先。route が null ならタイトル。
const _groups = <(String, List<(String, String?)>)>[
  ('入口', [('タイトル', null), ('選手トップ', 'play'), ('メニュー', 'menu'), ('名鑑', 'directory')]),
  (
    '試合',
    [('出場を選ぶ', 'game'), ('入力中', 'input'), ('スコア', 'score'), ('試合後', 'afterGame'), ('試合後の選手トップ', 'topAfterGame')],
  ),
  ('節目', [('シーズンの終了', 'seasonEnd'), ('来季の始まり', 'nextSeason'), ('引退の直後', 'farewell')]),
  ('そのほか', [('選手を作る', 'create'), ('試合の履歴', 'history'), ('引退した選手の詳細', 'retired'), ('設定', 'settings')]),
];

const _fixtureLabels = {
  Fixture.midseason: '4 年目の途中',
  Fixture.rookie: '新人',
  Fixture.seasonEnd: '全試合の後',
  Fixture.empty: '選手なし',
};

class ScreenJumpButton extends StatelessWidget {
  const ScreenJumpButton({super.key, required this.current, required this.navigator, required this.onJump});

  final LaunchOptions current;
  final GlobalKey<NavigatorState> navigator;
  final ValueChanged<Map<String, String>> onJump;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return Positioned(
      top: top > 40 ? (top - 36) / 2 : 4,
      left: 0,
      right: 0,
      child: Center(
        child: Material(
          color: const Color(0xFF120D09),
          shape: const StadiumBorder(side: BorderSide(color: Color(0xFFFAC400), width: 2)),
          child: InkWell(
            customBorder: const StadiumBorder(),
            onTap: () => _open(),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: Space.s400, vertical: Space.s150),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.apps, size: 16, color: Color(0xFFFAC400)),
                  SizedBox(width: Space.s100),
                  Text('画面', style: TextStyle(fontFamily: Txt.family, fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFFFFFDF9))),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _open() {
    final context = navigator.currentContext;
    if (context == null) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      sheetAnimationStyle: sheetAnimation(context),
      builder: (_) => _JumpSheet(current: current, onJump: onJump),
    );
  }
}

class _JumpSheet extends StatefulWidget {
  const _JumpSheet({required this.current, required this.onJump});

  final LaunchOptions current;
  final ValueChanged<Map<String, String>> onJump;

  @override
  State<_JumpSheet> createState() => _JumpSheetState();
}

class _JumpSheetState extends State<_JumpSheet> {
  late Fixture _fixture = widget.current.fixture;
  late bool _saveFailure = widget.current.saveFailure;

  void _go(String? route) {
    Navigator.of(context).pop();
    widget.onJump({
      'fixture': _fixture.name,
      'route': ?route,
      if (_saveFailure) 'saveFailure': '1',
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.85),
        child: ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s400),
          children: [
            Semantics(header: true, child: const Text('画面へ移る', style: Txt.heading)),
            Text('確かめるための移動です。選んだ画面を、固定のデータから開き直します。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
            const SectionTitle('データ'),
            ChoiceWrap<Fixture>(
              semanticsLabel: 'データ',
              values: _fixtureLabels.keys.toList(),
              label: (f) => _fixtureLabels[f]!,
              isSelected: (f) => f == _fixture,
              onSelected: (f) => setState(() => _fixture = f),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('次の保存を 1 回失敗させる'),
              value: _saveFailure,
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
                            fill: route == widget.current.route ? p.secondaryContainer : null,
                            onPressed: () => _go(route),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
