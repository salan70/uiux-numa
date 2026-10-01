import 'dart:math';

import 'package:flutter/material.dart';

import 'model.dart';
import 'pixel.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 顔の部品を選ぶ（D-37）。選手の作成、シーズンの終わり、選手の詳細の「顔を直す」で使う。
// 大きな見本を上に置き、部品ごとの札を下に並べる。札を押すとすぐ見本が替わる。「おまかせ」で無作為に組む。

class FaceEditor extends StatelessWidget {
  const FaceEditor({super.key, required this.face, required this.team, required this.onChanged, this.before});

  final Face face;

  /// 帽子と胸の色。
  final Color team;
  final ValueChanged<Face> onChanged;

  /// 前の季の顔。あれば見本の横に小さく並べて、変えたところを比べられるようにする。
  final Face? before;

  static final _random = Random();

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Widget label(String text) => Padding(
      padding: const EdgeInsets.only(top: Space.s300, bottom: Space.s100),
      child: Text(text, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
    );
    Widget choices<T>(String name, List<T> values, String Function(T) text, T selected, Face Function(T) apply) =>
        ChoiceWrap<T>(
          semanticsLabel: name,
          values: values,
          label: text,
          isSelected: (v) => v == selected,
          onSelected: (v) => onChanged(apply(v)),
        );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Night.board,
                borderRadius: BorderRadius.circular(Radii.control),
                border: Border.all(color: p.ink, width: Borders.thick),
              ),
              padding: const EdgeInsets.all(Space.s200),
              child: FaceAvatar(face: face, team: team, size: 96),
            ),
            if (before != null && before != face) ...[
              const SizedBox(width: Space.s300),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Opacity(opacity: 0.7, child: FaceAvatar(face: before!, team: team, size: 48)),
                  Text('前の年', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
                ],
              ),
            ],
            const Spacer(),
            PressButton(
              label: 'おまかせ',
              icon: Icons.casino_outlined,
              expand: false,
              dense: true,
              onPressed: () => onChanged(Face.random(_random.nextInt)),
            ),
          ],
        ),
        label('肌'),
        _Swatches(
          name: '肌',
          colors: skinColors,
          selected: face.skin,
          onSelected: (i) => onChanged(face.copyWith(skin: i)),
        ),
        label('髪型'),
        choices<HairStyle>('髪型', HairStyle.values, (h) => switch (h) {
          HairStyle.shaved => '坊主',
          HairStyle.sideburns => 'もみあげ',
          HairStyle.bangs => '前髪',
          HairStyle.long => '長髪',
        }, face.hair, (h) => face.copyWith(hair: h)),
        label('髪とひげの色'),
        _Swatches(
          name: '髪の色',
          colors: hairColors,
          names: const ['黒', '茶', '金', '赤', '白'],
          selected: face.hairColor,
          onSelected: (i) => onChanged(face.copyWith(hairColor: i)),
        ),
        label('眉'),
        choices<Brow>('眉', Brow.values, (b) => switch (b) {
          Brow.none => 'なし',
          Brow.thin => '細い',
          Brow.thick => '太い',
        }, face.brow, (b) => face.copyWith(brow: b)),
        label('目'),
        choices<Eyes>('目', Eyes.values, (e) => switch (e) {
          Eyes.dot => '点',
          Eyes.narrow => '細目',
          Eyes.round => '大きい',
        }, face.eyes, (e) => face.copyWith(eyes: e)),
        label('ひげ'),
        choices<Beard>('ひげ', Beard.values, (b) => switch (b) {
          Beard.none => 'なし',
          Beard.mustache => '口ひげ',
          Beard.chin => 'あごひげ',
          Beard.full => '口とあご',
          Beard.stubble => '無精ひげ',
        }, face.beard, (b) => face.copyWith(beard: b)),
        label('眼鏡'),
        choices<Glasses>('眼鏡', Glasses.values, (g) => switch (g) {
          Glasses.none => 'なし',
          Glasses.glasses => '眼鏡',
          Glasses.sunglasses => 'サングラス',
        }, face.glasses, (g) => face.copyWith(glasses: g)),
      ],
    );
  }
}

/// 色の見本の札。選んだものは輪郭を太くし、印を重ねる（色だけに頼らない）。
class _Swatches extends StatelessWidget {
  const _Swatches({required this.name, required this.colors, required this.selected, required this.onSelected, this.names});

  final String name;
  final List<Color> colors;
  final List<String>? names;
  final int selected;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Wrap(
      spacing: Space.s200,
      runSpacing: Space.s200,
      children: [
        for (var i = 0; i < colors.length; i++)
          Semantics(
            button: true,
            selected: i == selected,
            label: '$name ${names?[i] ?? '${i + 1}'}',
            child: InkWell(
              onTap: () => onSelected(i),
              customBorder: const CircleBorder(),
              child: Container(
                width: Sizes.target,
                height: Sizes.target,
                decoration: BoxDecoration(
                  color: colors[i],
                  shape: BoxShape.circle,
                  border: Border.all(color: p.ink, width: i == selected ? 4 : Borders.thick),
                ),
                child: i == selected
                    ? Icon(Icons.check, size: 20, color: colors[i].computeLuminance() > 0.4 ? Colors.black : Colors.white)
                    : null,
              ),
            ),
          ),
      ],
    );
  }
}

/// 選手の詳細の「顔を直す」。今の季（引退した選手は最後の季）の顔を直す。
Future<void> showFaceSheet(BuildContext context, Player player) {
  final store = StoreScope.read(context);
  var face = player.face;
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    sheetAnimationStyle: sheetAnimation(context),
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.9,
        maxChildSize: 0.95,
        builder: (context, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s600),
          children: [
            Semantics(header: true, child: Text('${player.current.year} 年の顔', style: Txt.heading)),
            Text('前の年の顔は変わりません。', style: Txt.caption.copyWith(color: Palette.of(context).onSurfaceVariant)),
            const SizedBox(height: Space.s300),
            FaceEditor(
              face: face,
              team: player.isActive ? teamColor(player.current.team) : Palette.of(context).outline,
              onChanged: (f) => setState(() => face = f),
            ),
            const SizedBox(height: Space.s400),
            PressButton(
              label: 'この顔にする',
              kind: PressKind.primary,
              onPressed: () {
                store.setFace(player, face);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    ),
  );
}
