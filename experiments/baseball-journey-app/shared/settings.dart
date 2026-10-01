import 'package:flutter/material.dart';

import 'parts.dart';
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
        // 開くたびに節を上から順に入れる。たまに開く画面なので、待たせない短い入場に留める。
        children: [
          for (final (i, w) in <Widget>[
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
          const SectionTitle('起動'),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('起動したら選手トップを開く'),
            subtitle: const Text('タイトルを飛ばし、最後に遊んだ現役の選手から始めます。'),
            value: store.openTopOnLaunch,
            onChanged: (v) {
              store.openTopOnLaunch = v;
              store.changed();
            },
          ),
          const SectionTitle('データ'),
          PressButton(
            label: '書き出す',
            icon: Icons.ios_share,
            onPressed: store.players.isEmpty
                ? null
                : () async {
                    store.exportAll();
                    await confirmDialog(
                      context,
                      title: '書き出しました',
                      message: '${store.players.length} 人の選手と足したタイトルを 1 つのファイルにしました。製品ではここで端末の共有が開き、保存先を選びます。',
                      confirm: '閉じる',
                      cancel: null,
                    );
                  },
          ),
          const SizedBox(height: Space.s100),
          Text(
            store.lastExportedAt == null ? 'まだ書き出していません。' : '最後に書き出した日時: ${_stamp(store.lastExportedAt!)}',
            style: Txt.caption.copyWith(color: p.onSurfaceVariant),
          ),
          const SizedBox(height: Space.s300),
          PressButton(
            label: '読み込む',
            icon: Icons.file_open_outlined,
            onPressed: () async {
              final ok = await confirmDialog(
                context,
                title: '今のデータと置き換えますか？',
                message: '今の ${store.players.length} 人の選手と足したタイトルが、読み込んだファイルの内容に置き換わります。読み込めなかったときは、今のデータを残します。',
                confirm: '置き換える',
                destructive: true,
              );
              if (!ok || !context.mounted) return;
              store.importAll();
              Navigator.of(context).popUntil((r) => r.isFirst);
            },
          ),
          const SizedBox(height: Space.s100),
          Text('試作では、見本のデータを読み込みます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
          const SizedBox(height: Space.s400),
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
        ].indexed) StaggerIn(index: i, child: w),
        ],
      ),
    );
  }
}

String _stamp(DateTime t) =>
    '${t.year} 年 ${t.month} 月 ${t.day} 日 ${t.hour}:${t.minute.toString().padLeft(2, '0')}';

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
                    borderRadius: BorderRadius.circular(Radii.control),
                    border: Border.all(color: p.ink, width: Borders.thick),
                    boxShadow: [BoxShadow(color: p.shadow, offset: const Offset(2, 2))],
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
