import 'dart:math';

import 'package:flutter/material.dart';

import 'fixture.dart';
import 'format.dart';
import 'model.dart';
import 'parts.dart';
import 'player_detail.dart';
import 'store.dart';
import 'theme.dart';
import 'widgets.dart';

// 選手の作成（player_creation.md）。製品の 5 段を、選手、能力、入団、確認の 4 段にした。
// 入団の経緯と契約は、どちらも入団した球団の話なので 1 段にまとめた。
// 「次へ」は押せないままにせず、押したときに足りない項目を文字で示す（States & Feedback の送信時の検証）。

const _familyNames = ['大空', '岩城', '風間', '早瀬', '橘', '神田', '日向', '真壁', '結城', '若松', '千早', '南雲'];
const _givenNames = ['翔', '剛', '迅', '陽介', '大地', '蓮', '拓海', '光', '颯', '陸', '直人', '誠'];

class PlayerCreationScreen extends StatefulWidget {
  const PlayerCreationScreen({super.key, required this.onCreated});

  final ValueChanged<Player> onCreated;

  @override
  State<PlayerCreationScreen> createState() => _PlayerCreationScreenState();
}

class _PlayerCreationScreenState extends State<PlayerCreationScreen> {
  final _draft = PlayerDraft();
  final _name = TextEditingController();
  final _league = TextEditingController();
  final _team = TextEditingController();
  final _country = TextEditingController(text: '日本');
  final _memo = TextEditingController();
  int _step = 0;
  bool _ageTouched = false;
  final _tried = <int>{};

  static const _steps = ['選手', '能力', '入団', '確認'];

  @override
  void dispose() {
    for (final c in [_name, _league, _team, _country, _memo]) {
      c.dispose();
    }
    super.dispose();
  }

  bool get _dirty => _name.text.isNotEmpty || _draft.positions.isNotEmpty || _team.text.isNotEmpty;

  List<String> _errors(int step) => switch (step) {
    0 => [
      if (_name.text.trim().isEmpty) '選手名を入力してください。',
      if (_name.text.characters.length > 20) '選手名は 20 字以内にしてください。',
      if (_draft.positions.isEmpty) '守備位置を 1 つ以上選んでください。',
    ],
    1 => [
      if (_draft.abilities.map((a) => a.name).toSet().length != _draft.abilities.length) '能力の名前は重ならないようにしてください。',
      if (_draft.abilities.any((a) => a.name.trim().isEmpty)) '能力の名前を入力してください。',
    ],
    2 => [
      if (_country.text.trim().isEmpty) '国名を入力してください。',
      if (_league.text.trim().isEmpty) 'リーグ名を入力してください。',
      if (_team.text.trim().isEmpty) '球団名を入力してください。',
    ],
    _ => [],
  };

  void _next() {
    setState(() => _tried.add(_step));
    if (_errors(_step).isNotEmpty) return;
    if (_step < _steps.length - 1) {
      setState(() => _step++);
      return;
    }
    _draft
      ..name = _name.text.trim()
      ..country = _country.text.trim()
      ..league = _league.text.trim()
      ..teamName = _team.text.trim()
      ..memo = _memo.text.trim();
    final player = StoreScope.read(context).createPlayer(_draft);
    widget.onCreated(player);
  }

  Future<void> _close() async {
    if (_dirty) {
      final ok = await confirmDialog(
        context,
        title: '作成をやめますか？',
        message: '入力した内容は保存されません。',
        confirm: 'やめる',
        cancel: '作成を続ける',
        destructive: true,
      );
      if (!ok || !mounted) return;
    }
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final errors = _tried.contains(_step) ? _errors(_step) : const <String>[];
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _step > 0 ? setState(() => _step--) : _close();
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: _close),
          title: const Text('選手を作る'),
        ),
        body: Column(
          children: [
            StepHeader(steps: _steps, current: _step),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
                children: [
                  if (errors.isNotEmpty) InputErrorSummary(errors: errors),
                  ...switch (_step) {
                    0 => _basic(p),
                    1 => _abilities(p),
                    2 => _joining(p),
                    _ => _confirm(p),
                  },
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: WizardBar(
          onBack: _step == 0 ? null : () => setState(() => _step--),
          next: _step == _steps.length - 1 ? '作成' : '次へ',
          onNext: _next,
        ),
      ),
    );
  }

  List<Widget> _basic(Palette p) {
    final err = _tried.contains(0);
    return [
      const FieldLabel('選手名'),
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: TextField(
              controller: _name,
              maxLength: 20,
              decoration: InputDecoration(
                hintText: '例: 大空 翔',
                errorText: err && _name.text.trim().isEmpty ? '選手名を入力してください。' : null,
                counterText: '',
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(width: Space.s200),
          PressButton(
            label: 'おまかせ',
            expand: false,
            icon: Icons.casino_outlined,
            semanticsHint: '名前を入れます',
            onPressed: () {
              final r = Random();
              _name.text =
                  '${_familyNames[r.nextInt(_familyNames.length)]} ${_givenNames[r.nextInt(_givenNames.length)]}';
              setState(() {});
            },
          ),
        ],
      ),
      const FieldLabel('経歴'),
      ChoiceWrap<CareerBackground>(
        semanticsLabel: '経歴',
        values: CareerBackground.values,
        label: (b) => b.label,
        isSelected: (b) => b == _draft.background,
        onSelected: (b) => setState(() {
          _draft.background = b;
          if (!_ageTouched) _draft.age = b.defaultAge;
        }),
      ),
      const SizedBox(height: Space.s300),
      NumberStepper(
        label: '入団時の年齢',
        value: _draft.age,
        min: 18,
        max: 50,
        unit: ' 歳',
        onChanged: (v) => setState(() {
          _ageTouched = true;
          _draft.age = v;
        }),
      ),
      const FieldLabel('投げる手'),
      ChoiceWrap<Hand>(
        semanticsLabel: '投げる手',
        values: const [Hand.right, Hand.left],
        label: (h) => '${h.label}投げ',
        isSelected: (h) => h == _draft.throws,
        onSelected: (h) => setState(() => _draft.throws = h),
      ),
      const FieldLabel('打席'),
      ChoiceWrap<Hand>(
        semanticsLabel: '打席',
        values: Hand.values,
        label: (h) => '${h.label}打ち',
        isSelected: (h) => h == _draft.bats,
        onSelected: (h) => setState(() => _draft.bats = h),
      ),
      FieldLabel('守備位置', note: _draft.positions.isEmpty ? '最初に選んだ位置がメインです' : 'メイン: ${_draft.positions.first.label}'),
      PositionPicker(
        selected: _draft.positions,
        onChanged: (v) => setState(() => _draft.positions = v),
        error: err && _draft.positions.isEmpty,
      ),
      const FieldLabel('からだ'),
      _SliderRow(
        label: '身長',
        value: _draft.height,
        min: 140,
        max: 220,
        unit: 'cm',
        onChanged: (v) => setState(() => _draft.height = v),
      ),
      _SliderRow(
        label: '体重',
        value: _draft.weight,
        min: 40,
        max: 150,
        unit: 'kg',
        onChanged: (v) => setState(() => _draft.weight = v),
      ),
    ];
  }

  List<Widget> _abilities(Palette p) {
    return [
      Text('能力は $minAbilities〜$maxAbilities 個です。名前を押すと変えられます。', style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
      const SizedBox(height: Space.s200),
      AbilityEditor(abilities: _draft.abilities, onChanged: (v) => setState(() => _draft.abilities = v)),
    ];
  }

  List<Widget> _joining(Palette p) {
    final err = _tried.contains(2);
    InputDecoration deco(String hint, TextEditingController c, String message) =>
        InputDecoration(hintText: hint, errorText: err && c.text.trim().isEmpty ? message : null);
    return [
      const FieldLabel('入団した球団'),
      ChoiceWrap<Team>(
        semanticsLabel: '球団の候補',
        values: fixtureTeams,
        label: (t) => t.name,
        isSelected: (t) => t.name == _team.text.trim(),
        onSelected: (t) => setState(() {
          _team.text = t.name;
          _league.text = t.league;
          _country.text = t.country;
          _draft.teamCount = t.teamCount;
        }),
      ),
      const SizedBox(height: Space.s300),
      TextField(controller: _team, decoration: deco('球団名', _team, '球団名を入力してください。'), onChanged: (_) => setState(() {})),
      const SizedBox(height: Space.s200),
      TextField(
        controller: _league,
        decoration: deco('リーグ名', _league, 'リーグ名を入力してください。'),
        onChanged: (_) => setState(() {}),
      ),
      const SizedBox(height: Space.s200),
      TextField(
        controller: _country,
        decoration: deco('国名', _country, '国名を入力してください。'),
        onChanged: (_) => setState(() {}),
      ),
      // MLB の全球団数を上限にする。
      NumberStepper(
        label: 'リーグの球団数',
        value: _draft.teamCount,
        min: 2,
        max: 30,
        unit: ' 球団',
        onChanged: (v) => setState(() => _draft.teamCount = v),
      ),
      const FieldLabel('入団の経路'),
      ChoiceWrap<JoiningRoute>(
        semanticsLabel: '入団の経路',
        values: JoiningRoute.values,
        label: (r) => r.label,
        isSelected: (r) => r == _draft.route,
        onSelected: (r) => setState(() => _draft.route = r),
      ),
      const SizedBox(height: Space.s300),
      if (_draft.route == JoiningRoute.draft)
        NumberStepper(
          label: 'ドラフト順位',
          value: _draft.draftRound,
          min: 1,
          max: 30,
          unit: ' 位',
          onChanged: (v) => setState(() => _draft.draftRound = v),
        ),
      NumberStepper(
        label: '入団年',
        value: _draft.joiningYear,
        min: 1900,
        max: 2100,
        unit: ' 年',
        onChanged: (v) => setState(() => _draft.joiningYear = v),
      ),
      NumberStepper(
        label: '背番号',
        value: _draft.uniformNumber,
        min: 0,
        max: 99,
        onChanged: (v) => setState(() => _draft.uniformNumber = v),
      ),
      SalaryField(value: _draft.salary, onChanged: (v) => setState(() => _draft.salary = v)),
      const FieldLabel('メモ', note: '任意'),
      TextField(
        controller: _memo,
        maxLines: 3,
        decoration: const InputDecoration(hintText: '例: 甲子園で 3 本塁打。地元の球団に 1 位で指名された。'),
      ),
    ];
  }

  List<Widget> _confirm(Palette p) {
    final d = _draft;
    Widget section(String title, int step, List<Widget> rows) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionTitle(
          title,
          trailing: TextButton(onPressed: () => setState(() => _step = step), child: const Text('直す')),
        ),
        ...rows,
      ],
    );
    return [
      section('選手', 0, [
        FactRow('選手名', _name.text.trim()),
        FactRow('経歴', '${d.background.label}・入団時 ${d.age} 歳'),
        FactRow('投打', '${d.throws.label}投${d.bats.label}打'),
        FactRow('守備', d.positions.map((e) => e.label).join('、')),
        FactRow('からだ', '${d.height} cm・${d.weight} kg'),
      ]),
      section('能力', 1, [for (final a in d.abilities) AbilityBar(ability: a)]),
      section('入団', 2, [
        FactRow('球団', '${_team.text.trim()}（${_league.text.trim()}・${_country.text.trim()}・${_draft.teamCount} 球団）'),
        FactRow('経路', d.route == JoiningRoute.draft ? 'ドラフト ${d.draftRound} 位' : d.route.label),
        FactRow('入団年', year(d.joiningYear)),
        FactRow('背番号', '${d.uniformNumber}'),
        FactRow('年俸', salary(d.salary)),
        if (_memo.text.trim().isNotEmpty) FactRow('メモ', _memo.text.trim()),
      ]),
    ];
  }
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.unit,
    required this.onChanged,
  });

  final String label;
  final int value;
  final int min;
  final int max;
  final String unit;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 56, child: Text(label, style: Txt.ui)),
        Expanded(
          child: Slider(
            value: value.toDouble(),
            min: min.toDouble(),
            max: max.toDouble(),
            divisions: max - min,
            semanticFormatterCallback: (v) => '${v.round()} $unit',
            onChanged: (v) => onChanged(v.round()),
          ),
        ),
        SizedBox(
          width: 72,
          child: Text('$value $unit', textAlign: TextAlign.right, style: Txt.control.merge(Txt.tabular)),
        ),
      ],
    );
  }
}

/// 年俸。300 万円から 10 億円まで、額に応じた刻みで動かす。
class SalaryField extends StatelessWidget {
  const SalaryField({super.key, required this.value, required this.onChanged, this.label = '年俸'});

  final int value;
  final ValueChanged<int> onChanged;
  final String label;

  static int _step(int v) => v < 3000
      ? 100
      : v < 10000
      ? 500
      : 1000;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.s200),
      child: Row(
        children: [
          Expanded(child: Text(label, style: Txt.control)),
          SizedBox(
            width: Sizes.target + Bold.shadow,
            child: KeyButton(
              label: '',
              icon: Icons.remove,
              semanticsLabel: '$label を下げる',
              onPressed: value > 300 ? () => onChanged(max(300, value - _step(value - 1))) : null,
            ),
          ),
          Semantics(
            liveRegion: true,
            child: SizedBox(
              width: 136,
              child: Text(
                salary(value),
                textAlign: TextAlign.center,
                style: Txt.figureSm.copyWith(color: p.onSurface),
              ),
            ),
          ),
          SizedBox(
            width: Sizes.target + Bold.shadow,
            child: KeyButton(
              label: '',
              icon: Icons.add,
              semanticsLabel: '$label を上げる',
              onPressed: value < 100000 ? () => onChanged(value + _step(value)) : null,
            ),
          ),
        ],
      ),
    );
  }
}

/// 守備位置の複数選択。選んだ順を番号で示し、先頭をメインにする。
class PositionPicker extends StatelessWidget {
  const PositionPicker({super.key, required this.selected, required this.onChanged, this.error = false});

  final List<Position> selected;
  final ValueChanged<List<Position>> onChanged;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ChoiceWrap<Position>(
          semanticsLabel: '守備位置',
          values: Position.values,
          label: (pos) {
            final i = selected.indexOf(pos);
            return i < 0 ? pos.label : '${pos.label} ${i + 1}';
          },
          isSelected: selected.contains,
          onSelected: (pos) =>
              onChanged(selected.contains(pos) ? (List.of(selected)..remove(pos)) : [...selected, pos]),
        ),
        if (error)
          Padding(
            padding: const EdgeInsets.only(top: Space.s100),
            child: Text('守備位置を 1 つ以上選んでください。', style: Txt.caption.copyWith(color: p.error)),
          ),
      ],
    );
  }
}

/// 能力の一覧。値はスライダー、名前は押して変え、3〜10 個の間で足し引きする。
class AbilityEditor extends StatelessWidget {
  const AbilityEditor({super.key, required this.abilities, required this.onChanged, this.before});

  final List<Ability> abilities;
  final ValueChanged<List<Ability>> onChanged;

  /// 前の季の値。シーズン終了で差を見せる。
  final List<Ability>? before;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    Future<String?> askName(String initial) {
      final c = TextEditingController(text: initial);
      return showDialog<String>(
        context: context,
        animationStyle: sheetAnimation(context),
        builder: (context) => AlertDialog(
          title: const Text('能力の名前'),
          content: TextField(controller: c, autofocus: true, maxLength: 8),
          actions: [
            PressButton(label: 'キャンセル', expand: false, dense: true, onPressed: () => Navigator.pop(context)),
            PressButton(
              label: '決定',
              kind: PressKind.primary,
              expand: false,
              dense: true,
              onPressed: () => Navigator.pop(context, c.text.trim()),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < abilities.length; i++)
          Builder(
            builder: (context) {
              final a = abilities[i];
              final was = before?.where((b) => b.name == a.name).firstOrNull?.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: Space.s100),
                child: Row(
                  children: [
                    SizedBox(
                      width: 96,
                      child: TextButton(
                        style: TextButton.styleFrom(alignment: Alignment.centerLeft, padding: EdgeInsets.zero),
                        onPressed: () async {
                          final name = await askName(a.name);
                          if (name != null && name.isNotEmpty) {
                            onChanged(List.of(abilities)..[i] = a.copyWith(name: name));
                          }
                        },
                        child: Text(a.name, style: Txt.control.copyWith(color: p.onSurface)),
                      ),
                    ),
                    SizedBox(width: 32, child: Text(a.rank, style: Txt.control)),
                    Expanded(
                      child: Slider(
                        value: a.value.toDouble(),
                        min: 1,
                        max: 99,
                        divisions: 98,
                        semanticFormatterCallback: (v) => '${a.name} ${v.round()}',
                        onChanged: (v) => onChanged(List.of(abilities)..[i] = a.copyWith(value: v.round())),
                      ),
                    ),
                    SizedBox(
                      width: 60,
                      child: Text(
                        was == null || was == a.value
                            ? '${a.value}'
                            : '${a.value} ${a.value > was ? '+' : '−'}${(a.value - was).abs()}',
                        textAlign: TextAlign.right,
                        style: Txt.control.merge(Txt.tabular),
                      ),
                    ),
                    if (before == null)
                      IconButton(
                        tooltip: '${a.name} を消す',
                        onPressed: abilities.length > minAbilities
                            ? () => onChanged(List.of(abilities)..removeAt(i))
                            : null,
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                  ],
                ),
              );
            },
          ),
        if (before == null) ...[
          const SizedBox(height: Space.s200),
          PressButton(
            label: '能力を足す',
            icon: Icons.add,
            onPressed: abilities.length < maxAbilities
                ? () async {
                    final name = await askName('');
                    if (name != null && name.isNotEmpty) onChanged([...abilities, Ability(name, 50)]);
                  }
                : null,
          ),
          if (abilities.length >= maxAbilities)
            Text('能力は $maxAbilities 個までです。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
        ],
      ],
    );
  }
}

class FieldLabel extends StatelessWidget {
  const FieldLabel(this.text, {super.key, this.note});

  final String text;
  final String? note;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: Space.s500, bottom: Space.s150),
      child: Wrap(
        spacing: Space.s200,
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          Text(text, style: Txt.control),
          if (note != null) Text(note!, style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
        ],
      ),
    );
  }
}

/// 段の見出し。「2 / 4 能力」と段の名前を並べ、今の段を文字で示す。
class StepHeader extends StatelessWidget {
  const StepHeader({super.key, required this.steps, required this.current});

  final List<String> steps;
  final int current;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      label: '${steps.length} 段のうち ${current + 1} 段目、${steps[current]}',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Space.page, 0, Space.page, Space.s200),
        child: Row(
          children: [
            for (var i = 0; i < steps.length; i++) ...[
              if (i > 0) const SizedBox(width: Space.s100),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 済んだ段と今の段を黄の升で埋め、今の段は名前を太字にする。升の塗りと字の太さの 2 つで示す。
                    Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: i <= current ? p.primary : p.surface,
                        border: Border.all(color: p.ink, width: Borders.thick),
                      ),
                    ),
                    const SizedBox(height: Space.s100),
                    Text(
                      steps[i],
                      style: Txt.caption.copyWith(
                        color: i == current ? p.onSurface : p.onSurfaceVariant,
                        fontWeight: i == current ? FontWeight.w700 : FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// 送信時の入力エラーの要約。
class InputErrorSummary extends StatelessWidget {
  const InputErrorSummary({super.key, required this.errors});

  final List<String> errors;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Semantics(
      liveRegion: true,
      child: Container(
        margin: const EdgeInsets.only(bottom: Space.s300),
        padding: const EdgeInsets.all(Space.s300),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: p.error, width: Bold.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [for (final e in errors) Text(e, style: Txt.ui.copyWith(color: p.error))],
        ),
      ),
    );
  }
}

/// 段を進める下端。戻るは左、次へは親指の届く右に固定する。
class WizardBar extends StatelessWidget {
  const WizardBar({
    super.key,
    required this.onBack,
    required this.next,
    required this.onNext,
    this.destructive = false,
  });

  final VoidCallback? onBack;
  final String next;
  final VoidCallback onNext;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Container(
      decoration: BoxDecoration(
        color: p.background,
        border: Border(top: BorderSide(color: p.ink, width: Borders.thick)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Space.page, Space.s300, Space.page, Space.s200),
          child: Row(
            children: [
              Expanded(
                child: PressButton(label: '戻る', onPressed: onBack),
              ),
              const SizedBox(width: Space.s300),
              Expanded(
                flex: 2,
                child: PressButton(
                  label: next,
                  kind: destructive ? PressKind.destructive : PressKind.primary,
                  onPressed: onNext,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
