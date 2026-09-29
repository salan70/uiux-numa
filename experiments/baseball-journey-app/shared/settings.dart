import 'package:flutter/material.dart';

import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 設定（settings.md）。製品の 4 タブと「保存」ボタンは、項目が 5 つしか無いので 1 画面にし、変えたらすぐ効く形にした。
// 文字の大きさは端末の設定に従い、アプリでは持たない（Accessibility の「利用者の設定を上書きしない」）。

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final p = Palette.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('設定')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s1000),
        children: [
          const SectionTitle('表示'),
          ChoiceWrap<ThemeMode>(
            semanticsLabel: '配色',
            values: ThemeMode.values,
            label: (m) => switch (m) {
              ThemeMode.system => '端末に合わせる',
              ThemeMode.light => 'ライト',
              ThemeMode.dark => 'ダーク',
            },
            isSelected: (m) => m == store.themeMode,
            onSelected: (m) {
              store.themeMode = m;
              store.changed();
            },
          ),
          const SizedBox(height: Space.s200),
          Text('文字の大きさは端末の設定に従います。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SectionTitle('操作'),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('効果音'),
            value: store.sound,
            onChanged: (v) {
              store.sound = v;
              store.changed();
            },
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('振動'),
            subtitle: const Text('保存したときと、押せない操作をしたときに震えます。'),
            value: store.haptics,
            onChanged: (v) {
              store.haptics = v;
              store.changed();
            },
          ),
          const SectionTitle('遊び方'),
          const HowToPlay(),
          const SectionTitle('データ'),
          PressButton(
            label: 'すべてのデータを消す',
            kind: PressKind.destructive,
            onPressed: () async {
              final first = await confirmDialog(
                context,
                title: 'すべてのデータを消しますか？',
                message: '${store.players.length} 人の選手と、足したタイトルが消えます。',
                confirm: '次へ',
              );
              if (!first || !context.mounted) return;
              final second = await confirmDialog(
                context,
                title: '元に戻せません',
                message: '消したデータは戻せません。本当に消しますか？',
                confirm: '消す',
                destructive: true,
              );
              if (second && context.mounted) {
                store.resetAll();
                Navigator.of(context).popUntil((r) => r.isFirst);
              }
            },
          ),
          const SectionTitle('このアプリについて'),
          const FactRow('版', '0.1.0（UI の試作）'),
          const FactRow('書体', 'LINE Seed JP（SIL Open Font License 1.1）'),
        ],
      ),
    );
  }
}

/// 遊び方。function_requirements.md のチュートリアルとヘルプを、初回の空の状態と設定の両方に置く。
class HowToPlay extends StatelessWidget {
  const HowToPlay({super.key});

  static const steps = [
    ('選手を作る', '名前、守備位置、能力、入団した球団を決めます。'),
    ('1 試合ずつ記録する', '打席の結果を押し、最後にスコアを入れて保存します。'),
    ('シーズンを終える', '順位とタイトルを選び、来季の契約と能力を決めます。'),
    ('名鑑で振り返る', '引退した選手も、年度別の成績と経歴が残ります。'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Column(
      children: [
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: Space.s300),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: p.primary,
                    shape: BoxShape.circle,
                    border: Border.all(color: p.ink, width: Borders.thick),
                  ),
                  child: Text('${i + 1}', style: Txt.control.copyWith(color: p.onPrimary)),
                ),
                const SizedBox(width: Space.s300),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(steps[i].$1, style: Txt.control),
                      Text(steps[i].$2, style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
