import 'package:flutter/material.dart';

import 'creation.dart';
import 'format.dart';
import 'model.dart';
import 'number_inputs.dart';
import 'parts.dart';
import 'pixel.dart';
import 'store.dart';
import 'team_candidates.dart';
import 'theme.dart';
import 'widgets.dart';
import 'year_page.dart';

// シーズン終了（season_end_wizard.md）と引退（retirement_wizard.md）。
// 製品の 7 段（成績と順位、タイトル、進退、移籍か契約、来季の能力、確認、完了）を、
// 今季（成績、順位、タイトル）、来季（進退と契約）、能力、確認の 4 段にした。順位を入れるとタイトルの候補が決まるので同じ段に置く。
// 引退を選ぶと、来季の契約と能力の段を飛ばし、引退の段（最終季と通算）へ進む。

enum _Choice {
  stay('残留'),
  transfer('移籍'),
  retire('引退');

  const _Choice(this.label);
  final String label;
}

class SeasonEndScreen extends StatefulWidget {
  const SeasonEndScreen({super.key, required this.player, required this.onFinished});

  final Player player;

  /// 次の季へ進んだら false、引退したら true。
  final ValueChanged<bool> onFinished;

  @override
  State<SeasonEndScreen> createState() => _SeasonEndScreenState();
}

class _SeasonEndScreenState extends State<SeasonEndScreen> {
  late final Season _season = widget.player.current;
  late final _ranks = <StatItem, int>{..._season.ranks};
  late final _titles = <String>{..._season.titles};
  _Choice _choice = _Choice.stay;
  late String _uniform = _season.uniformNumber;
  late int _salary = _season.salary;
  late int _teamCount = _season.team.teamCount;

  /// 来季の年間試合数。残留は今季の値、移籍は移籍先のリーグの値（初期値は今季の値。D-15）。
  late int _totalGames = _season.totalGames;
  final _team = TextEditingController();
  final _league = TextEditingController();
  final _country = TextEditingController();
  late List<Ability> _abilities = List.of(_season.abilities);
  late List<Position> _positions = List.of(widget.player.positions);
  late Hand _bats = widget.player.bats;
  final _careerRanks = <StatItem, int>{};
  int _step = 0;

  /// 段を進めたら右から、戻ったら左から入れるための、前に描いた段。
  int _shownStep = 0;

  double _direction() {
    final d = _step >= _shownStep ? 1.0 : -1.0;
    _shownStep = _step;
    return d;
  }
  final _tried = <int>{};
  bool _done = false;

  List<String> get _steps => _choice == _Choice.retire ? ['今季', '進退', '引退'] : ['今季', '来季', '能力', '確認'];

  @override
  void dispose() {
    _team.dispose();
    _league.dispose();
    _country.dispose();
    super.dispose();
  }

  List<String> _errors() => switch ((_step, _choice)) {
    (1, _Choice.stay) => [?UniformRule.either.check(_uniform)],
    (1, _Choice.transfer) => [
      ?UniformRule.either.check(_uniform),
      if (_team.text.trim().isEmpty) '移籍先の球団名を入力してください。',
      if (_league.text.trim().isEmpty) '移籍先のリーグ名を入力してください。',
      if (_country.text.trim().isEmpty) '移籍先の国名を入力してください。',
    ],
    (2, _Choice.stay || _Choice.transfer) => [if (_positions.isEmpty) '守備位置を 1 つ以上選んでください。'],
    _ => [],
  };

  SeasonEndInput _input() => SeasonEndInput(
    ranks: _ranks,
    titles: [
      for (final t in [...defaultTitles, ...StoreScope.read(context).customTitles])
        if (_titles.contains(t)) t,
    ],
    uniformNumber: _uniform,
    salary: _salary,
    abilities: _abilities,
    positions: _positions,
    bats: _bats,
    team: _choice == _Choice.transfer
        ? Team(
            name: _team.text.trim(),
            abbreviation: _team.text.trim().characters.take(3).toString(),
            league: _league.text.trim(),
            country: _country.text.trim(),
            teamCount: _teamCount,
          )
        : null,
    careerRanks: _careerRanks,
    totalGames: _totalGames,
  );

  Future<void> _next() async {
    setState(() => _tried.add(_step));
    if (_errors().isNotEmpty) return;
    if (_step < _steps.length - 1) {
      setState(() => _step++);
      return;
    }
    final store = StoreScope.read(context);
    if (_choice == _Choice.retire) {
      final ok = await confirmDialog(
        context,
        title: '${widget.player.name}が引退します',
        message: '引退すると、この選手では試合を記録できなくなります。記録は名鑑に残ります。',
        confirm: '引退',
        cancel: '考え直す',
        destructive: true,
      );
      if (!ok || !mounted) return;
      store.retire(_input());
    } else {
      store.endSeason(_input());
    }
    setState(() => _done = true);
  }

  Future<void> _cancel() async {
    final ok = await confirmDialog(
      context,
      title: 'シーズンの終了をやめますか？',
      message: '入力した順位、タイトル、契約は保存されません。',
      confirm: 'やめる',
      cancel: '続ける',
      destructive: true,
    );
    if (ok && mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    if (_done) {
      return _choice == _Choice.retire
          ? RetiredScreen(player: widget.player, onClose: () => widget.onFinished(true))
          : NextSeasonScreen(player: widget.player, onClose: () => widget.onFinished(false));
    }
    final p = Palette.of(context);
    final errors = _tried.contains(_step) ? _errors() : const <String>[];
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _step > 0 ? setState(() => _step--) : _cancel();
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(tooltip: '閉じる', icon: const Icon(Icons.close), onPressed: _cancel),
          title: Text('${year(_season.year)}の終わり'),
        ),
        body: Column(
          children: [
            StepHeader(steps: _steps, current: _step),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(Space.page, Space.s200, Space.page, Space.s1000),
                children: [
                  if (errors.isNotEmpty) InputErrorSummary(errors: errors),
                  // 段を替えたら、段の中身を 1 つの塊として、進む向き（進めば右、戻れば左）から入れる（空間の連続）。
                  // 欄ごとに遅らせると、選んで欄が増えたときに並びのずれた欄まで入り直すので、塊で動かす。
                  StaggerIn(
                    key: ValueKey(_step),
                    from: Offset(16.0 * _direction(), 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: switch (_step) {
                        0 => _thisSeason(p),
                        1 => _nextSeason(p),
                        2 when _choice == _Choice.retire => _retire(p),
                        2 => _ability(p),
                        _ => _confirm(p),
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: WizardBar(
          onBack: _step == 0 ? null : () => setState(() => _step--),
          next: _step < _steps.length - 1
              ? '次へ'
              : _choice == _Choice.retire
              ? '引退'
              : '${_season.year + 1} 年へ',
          destructive: _step == _steps.length - 1 && _choice == _Choice.retire,
          onNext: _next,
        ),
      ),
    );
  }

  List<Widget> _thisSeason(Palette p) {
    final store = StoreScope.of(context);
    final line = _season.line;
    return [
      // その年の 1 ページを最初に見せ、1 年の手応えを返してから順位とタイトルを選ぶ（D-19、U-8）。
      Panel(child: YearPage(player: widget.player, season: _season, showTitles: false)),
      SectionTitle(
        'リーグの順位',
        trailing: Text('任意', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ),
      Text('3 位までを選ぶと、1 位の項目のタイトルを先に選びます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      const SizedBox(height: Space.s200),
      for (final item in StatItem.values)
        RankRow(
          item: item,
          value: line.valueOf(item),
          rank: _ranks[item],
          onChanged: (r) => setState(() {
            if (r == null) {
              _ranks.remove(item);
            } else {
              _ranks[item] = r;
            }
            if (r == 1) _titles.add(item.title);
          }),
        ),
      const SectionTitle('タイトル'),
      ChoiceWrap<String>(
        semanticsLabel: 'タイトル',
        values: [...defaultTitles, ...store.customTitles],
        label: (t) => t,
        isSelected: _titles.contains,
        onSelected: (t) => setState(() => _titles.contains(t) ? _titles.remove(t) : _titles.add(t)),
      ),
      const SizedBox(height: Space.s200),
      Align(
        alignment: Alignment.centerLeft,
        child: PressButton(
          label: 'タイトルを足す',
          icon: Icons.add,
          expand: false,
          dense: true,
          onPressed: () async {
            final name = await _askTitle(context);
            if (name == null || name.isEmpty) return;
            store.addCustomTitle(name);
            setState(() => _titles.add(name));
          },
        ),
      ),
      const SizedBox(height: Space.s200),
      Text('足したタイトルは、ほかの選手でも選べます。', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
    ];
  }

  List<Widget> _nextSeason(Palette p) {
    final err = _tried.contains(1);
    return [
      const FieldLabel('来季の進退'),
      ChoiceWrap<_Choice>(
        semanticsLabel: '来季の進退',
        values: _Choice.values,
        label: (c) => c.label,
        isSelected: (c) => c == _choice,
        onSelected: (c) => setState(() => _choice = c),
      ),
      if (_choice == _Choice.retire) ...[
        const SizedBox(height: Space.s400),
        Panel(
          child: Text('次の段で最終季と通算の成績を確かめてから、引退します。契約と能力の段はありません。', style: Txt.body.copyWith(color: p.onSurface)),
        ),
      ] else ...[
        if (_choice == _Choice.transfer) ...[
          const FieldLabel('移籍先'),
          TeamCandidates(
            selectedTeam: _team.text.trim(),
            selectedLeague: _league.text.trim(),
            exclude: _season.team.name,
            onTeam: (t) => setState(() {
              _team.text = t.team.name;
              _league.text = t.team.league;
              _country.text = t.team.country;
              _teamCount = t.team.teamCount;
              _totalGames = t.games;
            }),
            onLeague: (l) => setState(() {
              _league.text = l.league;
              _country.text = l.country;
              _teamCount = l.teamCount;
              _totalGames = l.games;
            }),
          ),
          TextField(
            controller: _team,
            decoration: InputDecoration(
              hintText: '球団名',
              errorText: err && _team.text.trim().isEmpty ? '移籍先の球団名を入力してください。' : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: Space.s200),
          TextField(
            controller: _league,
            decoration: InputDecoration(
              hintText: 'リーグ名',
              errorText: err && _league.text.trim().isEmpty ? '移籍先のリーグ名を入力してください。' : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: Space.s200),
          TextField(
            controller: _country,
            decoration: InputDecoration(
              hintText: '国名',
              errorText: err && _country.text.trim().isEmpty ? '移籍先の国名を入力してください。' : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          // MLB の全球団数を上限にする。
          NumberStepper(
            label: 'リーグの球団数',
            value: _teamCount,
            min: 2,
            max: 30,
            unit: ' 球団',
            onChanged: (v) => setState(() => _teamCount = v),
          ),
          NumberStepper(
            label: '年間試合数',
            value: _totalGames,
            min: 1,
            max: 200,
            unit: ' 試合',
            onChanged: (v) => setState(() => _totalGames = v),
          ),
        ],
        FieldLabel('来季の契約', note: '今季: 背番号 ${_season.uniformNumber}・${salary(_season.salary)}'),
        UniformNumberField(value: _uniform, rule: UniformRule.either, onChanged: (v) => setState(() => _uniform = v)),
        SalaryField(value: _salary, base: _season.salary, onChanged: (v) => setState(() => _salary = v)),
      ],
    ];
  }

  List<Widget> _ability(Palette p) {
    final err = _tried.contains(2);
    return [
      Text('今季の値から動かします。右の数は今季との差です。', style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
      const SizedBox(height: Space.s200),
      AbilityEditor(abilities: _abilities, before: _season.abilities, onChanged: (v) => setState(() => _abilities = v)),
      FieldLabel('守備位置', note: _positions.isEmpty ? null : 'メイン: ${_positions.first.label}'),
      PositionPicker(
        selected: _positions,
        onChanged: (v) => setState(() => _positions = v),
        error: err && _positions.isEmpty,
      ),
      const FieldLabel('打席'),
      ChoiceWrap<Hand>(
        semanticsLabel: '打席',
        values: Hand.values,
        label: (h) => '${h.label}打ち',
        isSelected: (h) => h == _bats,
        onSelected: (h) => setState(() => _bats = h),
      ),
    ];
  }

  List<Widget> _confirm(Palette p) {
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
    final changed = [
      for (final a in _abilities)
        if (_season.abilities.where((b) => b.name == a.name).firstOrNull?.value != a.value) a,
    ];
    return [
      section('今季', 0, [
        FactRow('順位', _ranks.isEmpty ? 'なし' : _ranks.entries.map((e) => '${e.key.label} ${e.value} 位').join('、')),
        FactRow('タイトル', _titles.isEmpty ? 'なし' : _titles.join('、')),
      ]),
      section('来季', 1, [
        FactRow(
          '進退',
          _choice == _Choice.transfer
              ? '移籍: ${_team.text.trim()}（${_country.text.trim()}・$_teamCount 球団）'
              : '残留: ${_season.team.name}',
        ),
        FactRow('背番号', _uniform),
        FactRow('年俸', salary(_salary)),
      ]),
      section('能力', 2, [
        FactRow('変えた能力', changed.isEmpty ? 'なし' : changed.map((a) => '${a.name} ${a.value}').join('、')),
        FactRow('守備', _positions.map((e) => e.label).join('、')),
        FactRow('打席', '${_bats.label}打ち'),
      ]),
    ];
  }

  List<Widget> _retire(Palette p) {
    final career = widget.player.career;
    return [
      const SectionTitle('最終季の成績'),
      Panel(child: SeasonStatGrid(line: _season.line, large: false)),
      SectionTitle('通算の成績', trailing: Text('${widget.player.proYears} 年', style: Txt.caption)),
      Panel(child: SeasonStatGrid(line: career, large: false)),
      SectionTitle(
        '通算の順位',
        trailing: Text('任意', style: Txt.caption.copyWith(color: p.onSurfaceVariant)),
      ),
      for (final item in StatItem.values)
        RankRow(
          item: item,
          value: career.valueOf(item),
          rank: _careerRanks[item],
          maxRank: 10,
          onChanged: (r) => setState(() => r == null ? _careerRanks.remove(item) : _careerRanks[item] = r),
        ),
    ];
  }
}

/// 順位の 1 行。「なし、1、2、3」の札を横に並べる。
class RankRow extends StatelessWidget {
  const RankRow({
    super.key,
    required this.item,
    required this.value,
    required this.rank,
    required this.onChanged,
    this.maxRank = 3,
  });

  final StatItem item;
  final num? value;
  final int? rank;
  final ValueChanged<int?> onChanged;
  final int maxRank;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final shown = value == null
        ? '---'
        // Web では整数も double になるので、型ではなく項目で率かどうかを決める。
        : item == StatItem.average || item == StatItem.obp
        ? rate(value!.toDouble())
        : grouped(value!.toInt());
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.s100),
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: Space.s200,
        runSpacing: Space.s100,
        children: [
          SizedBox(
            width: 116,
            child: Text.rich(
              TextSpan(
                children: [
                  TextSpan(text: '${item.label} ', style: Txt.ui),
                  TextSpan(text: shown, style: Txt.control.merge(Txt.tabular)),
                ],
              ),
            ),
          ),
          if (maxRank <= 3)
            ChoiceWrap<int?>(
              semanticsLabel: '${item.label}の順位',
              values: const [null, 1, 2, 3],
              // 「位」は見出し（リーグの順位）が示すので札には書かず、項目と札を 1 行に収める。
              label: (r) => r == null ? 'なし' : '$r',
              isSelected: (r) => r == rank,
              onSelected: onChanged,
            )
          else
            DropdownButton<int?>(
              value: rank,
              hint: Text('なし', style: Txt.ui.copyWith(color: p.onSurfaceVariant)),
              items: [
                const DropdownMenuItem<int?>(value: null, child: Text('なし')),
                for (var r = 1; r <= maxRank; r++) DropdownMenuItem<int?>(value: r, child: Text('$r 位')),
              ],
              onChanged: onChanged,
            ),
        ],
      ),
    );
  }
}

Future<String?> _askTitle(BuildContext context) {
  final name = TextEditingController();
  final about = TextEditingController();
  return showDialog<String>(
    context: context,
    animationStyle: sheetAnimation(context),
    builder: (context) => AlertDialog(
      title: const Text('タイトルを足す'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: name,
            autofocus: true,
            maxLength: 16,
            decoration: const InputDecoration(hintText: '名前（例: 月間 MVP）'),
          ),
          TextField(
            controller: about,
            decoration: const InputDecoration(hintText: '概要（任意）'),
          ),
        ],
      ),
      actions: [
        PressButton(label: 'キャンセル', expand: false, dense: true, onPressed: () => Navigator.pop(context)),
        PressButton(
          label: '足す',
          kind: PressKind.primary,
          expand: false,
          dense: true,
          onPressed: () => Navigator.pop(context, name.text.trim()),
        ),
      ],
    ),
  );
}

/// 次の季へ進んだ直後。完了の段（step 7）を、来季の始まりの画面にした。
/// タイトル画面と同じ夜の球場に、掲示板の年を灯して開幕を告げる。
class NextSeasonScreen extends StatelessWidget {
  const NextSeasonScreen({super.key, required this.player, required this.onClose});

  final Player player;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    final s = player.current;
    return Scaffold(
      backgroundColor: Night.field,
      body: CustomPaint(
        painter: const NightFieldPainter(),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(Space.s600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                BoldBox(
                  color: Night.board,
                  padding: const EdgeInsets.symmetric(vertical: Space.s600, horizontal: Space.s400),
                  child: Column(
                    children: [
                      DotText(['${s.year}'], pitch: 9, offColor: Night.ledOff, label: year(s.year)),
                      const SizedBox(height: Space.s300),
                      Semantics(
                        header: true,
                        child: Text('シーズンへ', textAlign: TextAlign.center, style: Txt.title.copyWith(color: Night.ink)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Space.s400),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    PixelAvatar(player: player, size: 40),
                    const SizedBox(width: Space.s200),
                    Flexible(
                      child: Text(
                        '${s.team.name}・背番号 ${s.uniformNumber}・${salary(s.salary)}',
                        style: Txt.ui.copyWith(color: Night.ink),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                KeyButton(label: '開幕へ', fill: p.primary, onPressed: onClose),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 引退の直後。選手の札と通算の成績を 1 枚にまとめ、名鑑へ送る。
/// 引退は選手に 1 度だけの節目なので、記録達成と同じドットの紙吹雪を 1 回だけ散らす。
class RetiredScreen extends StatelessWidget {
  const RetiredScreen({super.key, required this.player, required this.onClose});

  final Player player;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final p = Palette.of(context);
    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(Space.page, Space.s600, Space.page, Space.s600),
              children: [
                Semantics(
                  header: true,
                  child: Text('おつかれさまでした', textAlign: TextAlign.center, style: Txt.title),
                ),
                const SizedBox(height: Space.s200),
                Text(
                  '${player.name}は ${player.proYears} 年のプロ生活を終えました。記録は名鑑に残ります。',
                  textAlign: TextAlign.center,
                  style: Txt.body.copyWith(color: p.onSurfaceVariant),
                ),
                const SizedBox(height: Space.s500),
                PlayerHeader(player: player),
                const SectionTitle('通算の成績'),
                Panel(child: SeasonStatGrid(line: player.career, large: false)),
                const SizedBox(height: Space.s600),
                KeyButton(label: '名鑑で見る', fill: p.primary, onPressed: onClose),
              ],
            ),
          ),
          const Positioned.fill(child: PixelBurst(delay: Duration(milliseconds: 300))),
        ],
      ),
    );
  }
}
