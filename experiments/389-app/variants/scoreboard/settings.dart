import 'package:flutter/material.dart';

import '../../shared/ds.dart';
import '../../shared/icons.dart';
import '../../shared/play.dart';
import '../../shared/app.dart';

// 設定の画面。製品では設定ダイアログ（お問い合わせ、利用規約、プライバシーポリシー、プッシュ通知）と、
// 広告非表示のダイアログ（動画広告で一定時間広告を消す）に分かれていた。
// 試作では 1 画面にまとめ、v2 の Pattern B（設定の項目を DsCard で縦に積み、隅のアクセントの色で項目を見分ける）に従う。
// 選択は画面の中で完結させ、モーダルへ逃がさない（Pattern B）。変えたらすぐ効き、保存の操作は持たない。
// query の notif=denied で、端末の設定で通知が拒否されている状態にする。

/// 試作の中だけで持つ設定の値。製品では端末と通知のサービスに保存する。
class _Prefs {
  static bool dailyUpdate = true;
  static bool dailyRemind = true;
  static bool news = false;

  /// 今日、動画広告を見た回数。1 日 2 回まで（製品の hide_ad_dialog_page）。
  static int adsWatched = 0;
}

const _version = '5.1.1';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, this.focusAds = false});

  /// 広告非表示のボタンから開いたとき。広告の項目を先頭に置く。
  final bool focusAds;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _denied = Uri.base.queryParameters['notif'] == 'denied';

  @override
  Widget build(BuildContext context) {
    final ads = _AdsCard(onChanged: () => setState(() {}));
    final notify = _section(
      title: 'プッシュ通知',
      accent: DsColor.actionEmphasis,
      children: [
        if (_denied) ...[
          DsSurface(
            backgroundColor: DsColor.background,
            borderColor: DsColor.incorrect,
            padding: const EdgeInsets.all(12),
            child: Text('端末の設定で通知が拒否されています。設定アプリから許可すると、ここで選べます。', style: DsTypography.caption.copyWith(color: DsColor.contentPrimary)),
          ),
          const SizedBox(height: DsSpacing.space12),
        ],
        _SwitchRow(title: '今日の1問の更新', note: '毎日 19:00 に通知します。', value: _Prefs.dailyUpdate, enabled: !_denied, onChanged: (v) => setState(() => _Prefs.dailyUpdate = v)),
        _SwitchRow(title: '今日の1問のリマインド', note: '未プレイの日は、締め切りの 30 分前に通知します。', value: _Prefs.dailyRemind, enabled: !_denied, onChanged: (v) => setState(() => _Prefs.dailyRemind = v)),
        _SwitchRow(title: 'その他のお知らせ', note: '不定期に通知します。', value: _Prefs.news, enabled: !_denied, onChanged: (v) => setState(() => _Prefs.news = v), last: true),
      ],
    );
    final other = _section(
      title: 'その他',
      accent: DsColor.actionPrimary,
      children: [
        _LinkRow(title: 'お問い合わせ', onTap: () => _note('お問い合わせのフォーム')),
        _LinkRow(title: 'レビューする', onTap: () => _note('App Store のレビューの画面')),
        _LinkRow(title: '利用規約', onTap: () => _note('利用規約のページ')),
        _LinkRow(title: 'プライバシーポリシー', onTap: () => _note('プライバシーポリシーのページ'), last: true),
      ],
    );
    return Scaffold(
      body: Column(
        children: [
          DsPageHeader(
            title: '設定',
            leading: DsHeaderIconButton(icon: DsGlyph.chevronLeft, tooltip: '戻る', onPressed: () => Navigator.of(context).maybePop()),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              children: [
                ...(widget.focusAds ? [ads, notify] : [notify, ads]),
                other,
                const SizedBox(height: DsSpacing.space8),
                Text(
                  'バージョン $_version',
                  textAlign: TextAlign.center,
                  style: DsTypography.caption.copyWith(color: DsColor.disabledContent),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _note(String what) => showProductNote(context, '製品では、$whatを開く。試作では開かない。');

  Widget _section({required String title, required Color accent, required List<Widget> children}) => Padding(
    padding: const EdgeInsets.only(bottom: DsSpacing.space16),
    child: DsCard(
      accentColor: accent,
      hasShadow: true,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: DsSpacing.space8),
          ...children,
        ],
      ),
    ),
  );
}

/// スイッチの 1 行。題と、何が起きるかの 1 文を左に、スイッチを右に置く。行全体を押しても切り替わる。
class _SwitchRow extends StatelessWidget {
  const _SwitchRow({required this.title, required this.note, required this.value, required this.onChanged, this.enabled = true, this.last = false});

  final String title;
  final String note;
  final bool value;
  final bool enabled;
  final bool last;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) => Semantics(
    toggled: value,
    enabled: enabled,
    label: '$title。$note',
    excludeSemantics: true,
    onTap: enabled ? () => onChanged(!value) : null,
    child: GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: enabled ? () => onChanged(!value) : null,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: last ? null : const Border(bottom: BorderSide(color: DsColor.disabledSurface)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: DsTypography.body2.copyWith(color: enabled ? DsColor.contentPrimary : DsColor.disabledContent, fontWeight: FontWeight.w700),
                  ),
                  Text(note, style: DsTypography.caption.copyWith(color: enabled ? DsColor.contentSecondary : DsColor.disabledContent)),
                ],
              ),
            ),
            const SizedBox(width: DsSpacing.space12),
            _DsSwitch(value: value && enabled, enabled: enabled),
          ],
        ),
      ),
    ),
  );
}

/// v2 の造形のスイッチ。入りは cyan の面に 2px の濃紺の輪郭と小さな影、切りは無効の面。つまみは濃紺の正方形に近い角丸。
class _DsSwitch extends StatelessWidget {
  const _DsSwitch({required this.value, required this.enabled});

  final bool value;
  final bool enabled;

  @override
  Widget build(BuildContext context) => AnimatedContainer(
    duration: const Duration(milliseconds: 160),
    curve: Curves.easeOut,
    width: 52,
    height: 30,
    padding: const EdgeInsets.all(3),
    decoration: BoxDecoration(
      color: value ? DsColor.actionPrimary : DsColor.disabledSurface,
      borderRadius: DsRadius.borderSm,
      border: Border.all(color: value ? DsColor.onAction : DsColor.disabledSurface, width: DsBorder.standard),
      boxShadow: value ? DsShadow.xs : null,
    ),
    child: AnimatedAlign(
      duration: const Duration(milliseconds: 160),
      curve: Curves.easeOut,
      alignment: value ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(color: value ? DsColor.onAction : (enabled ? DsColor.contentSecondary : DsColor.disabledContent), borderRadius: DsRadius.borderXs),
      ),
    ),
  );
}

/// 外のページを開く 1 行。右端に外へ出る印を置く。
class _LinkRow extends StatelessWidget {
  const _LinkRow({required this.title, required this.onTap, this.last = false});

  final String title;
  final VoidCallback onTap;
  final bool last;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: title,
    excludeSemantics: true,
    child: GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          border: last ? null : const Border(bottom: BorderSide(color: DsColor.disabledSurface)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: DsTypography.body2.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
              ),
            ),
            const DsIcon(DsGlyph.link, size: 18, color: DsColor.contentSecondary),
          ],
        ),
      ),
    ),
  );
}

/// 広告の項目。今の広告の状態を先に、動画広告で消す操作を後に置く。
/// 製品の規則: 1 回見ると 1 時間広告なし。2 回見て今日の1問を遊ぶと、次の 19:00 まで広告なし。動画広告は 1 日 2 回まで。
class _AdsCard extends StatelessWidget {
  const _AdsCard({required this.onChanged});

  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final n = _Prefs.adsWatched;
    final daily = profile.dailyDone;
    final until = n == 0 ? null : (n >= 2 && daily ? '次の 19:00' : '17:48');
    return Padding(
      padding: const EdgeInsets.only(bottom: DsSpacing.space16),
      child: DsCard(
        accentColor: DsColor.rankHighlight,
        hasShadow: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Text(
                  '広告',
                  style: DsTypography.body1.copyWith(color: DsColor.contentPrimary, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                DsStatusDot(color: until == null ? DsColor.disabledContent : DsColor.statusSuccess),
                const SizedBox(width: 6),
                Text(
                  until == null ? '表示中' : '$until まで非表示',
                  style: DsTypography.caption.copyWith(color: until == null ? DsColor.contentSecondary : DsColor.statusSuccess, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: DsSpacing.space12),
            _Rule(step: '1 回', text: '1 時間、広告を表示しません。', done: n >= 1),
            const SizedBox(height: DsSpacing.space8),
            _Rule(step: '2 回', text: '今日の1問も遊ぶと、次の 19:00 まで広告を表示しません。', done: n >= 2 && daily),
            const SizedBox(height: DsSpacing.space16),
            Row(
              children: [
                Text('今日の視聴 ', style: DsTypography.caption.copyWith(color: DsColor.contentSecondary)),
                DsDisplayNumber('$n', fontSize: 18, color: DsColor.rankHighlight),
                DsDisplayNumber('/2', fontSize: 14, color: DsColor.contentSecondary),
                const Spacer(),
                SizedBox(
                  width: 168,
                  child: DsButton(
                    label: n >= 2 ? '今日は見終わりました' : '動画広告を見る',
                    type: DsButtonType.secondary,
                    small: true,
                    onPressed: n >= 2
                        ? null
                        : () {
                            _Prefs.adsWatched++;
                            onChanged();
                          },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Rule extends StatelessWidget {
  const _Rule({required this.step, required this.text, required this.done});

  final String step;
  final String text;
  final bool done;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(
        width: 44,
        child: DsBadge(label: step, color: done ? DsColor.statusSuccess : DsColor.surface, foreground: done ? DsColor.onAction : DsColor.contentSecondary),
      ),
      const SizedBox(width: DsSpacing.space8),
      Expanded(
        child: Text(text, style: DsTypography.caption.copyWith(color: DsColor.contentPrimary, height: 1.6)),
      ),
    ],
  );
}
