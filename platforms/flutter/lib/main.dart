import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import 'registry.g.dart';

// 実行基盤の責務は experiments/<slug>/variants/<id>/index.dart の buildVariant を列挙して描くことだけ。
// URL の query で variant と表示条件を選ぶ。variant 固有の query（例: fixture）は variant 自身が Uri.base から読む。
//
//   variant=<slug>/<id>   その variant だけを描く。無ければ一覧を出す
//   bare=1                端末の枠を描かず、窓いっぱいに描く。preview の撮影に使う
//   theme=light|dark      端末の明暗を上書きする
//   textScale=<倍率>      端末の文字の拡大を上書きする（例: 2）
//   reduceMotion=1        端末の動きの抑制を上書きする
//   semantics=1           起動時に支援技術向けの DOM を作る。読み上げと自動操作の確認に使う

/// iPhone 17 の論理解像度と安全領域。Web には安全領域が無いので、端末で塞がる帯をここで再現する。
const _deviceSize = Size(402, 874);
const _deviceInsets = EdgeInsets.only(top: 62, bottom: 34);

void main() {
  final query = Uri.base.queryParameters;
  if (query['semantics'] == '1') {
    WidgetsFlutterBinding.ensureInitialized();
    SemanticsBinding.instance.ensureSemantics();
  }
  final options = RunnerOptions.fromQuery(query);
  final selected = variantEntries.where((e) => e.id == query['variant']).firstOrNull;
  runApp(
    selected == null
        ? _VariantList(options: options)
        : _Device(options: options, bare: query['bare'] == '1', child: selected.build()),
  );
}

class RunnerOptions {
  const RunnerOptions({this.brightness, this.textScale, this.reduceMotion = false});

  factory RunnerOptions.fromQuery(Map<String, String> query) => RunnerOptions(
    brightness: switch (query['theme']) {
      'dark' => Brightness.dark,
      'light' => Brightness.light,
      _ => null,
    },
    textScale: double.tryParse(query['textScale'] ?? ''),
    reduceMotion: query['reduceMotion'] == '1',
  );

  final Brightness? brightness;
  final double? textScale;
  final bool reduceMotion;

  MediaQueryData apply(MediaQueryData data) => data.copyWith(
    platformBrightness: brightness ?? data.platformBrightness,
    textScaler: textScale == null ? data.textScaler : TextScaler.linear(textScale!),
    disableAnimations: reduceMotion || data.disableAnimations,
  );
}

/// variant を端末の大きさで描く。bare では枠を描かず左上に置く。
/// headless Chrome は窓の最小幅が端末より広く、窓の大きさに合わせると撮影の範囲と描画の幅がずれる。
class _Device extends StatelessWidget {
  const _Device({required this.options, required this.bare, required this.child});

  final RunnerOptions options;
  final bool bare;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final view = MediaQueryData.fromView(View.of(context));
    final framed = !bare && view.size.width > _deviceSize.width + 80;
    final size = bare || framed ? _deviceSize : view.size;
    final device = MediaQuery(
      data: options.apply(view).copyWith(size: size, padding: _deviceInsets, viewPadding: _deviceInsets),
      child: child,
    );
    if (bare) {
      return Align(
        alignment: Alignment.topLeft,
        child: SizedBox.fromSize(size: size, child: device),
      );
    }
    if (!framed) return device;
    return ColoredBox(
      color: const Color(0xFF3A3A3A),
      child: Center(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(44),
          child: SizedBox.fromSize(size: size, child: device),
        ),
      ),
    );
  }
}

class _VariantList extends StatelessWidget {
  const _VariantList({required this.options});

  final RunnerOptions options;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'uiux-numa Flutter runner',
      theme: ThemeData(fontFamily: 'LINE Seed JP'),
      home: Scaffold(
        appBar: AppBar(title: const Text('variant')),
        body: variantEntries.isEmpty
            ? const Center(child: Text('variant がありません'))
            : ListView(
                children: [
                  for (final entry in variantEntries)
                    ListTile(
                      title: Text('${entry.experiment} / ${entry.variant}'),
                      subtitle: Text('?variant=${entry.id}'),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => _Device(options: options, bare: false, child: entry.build()),
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}
